import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import * as nodemailer from 'nodemailer';

interface UserWithPendingReview {
  id: string;
  email: string;
  pendingCount: number;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private prisma: PrismaService) {
    this.initTransporter();
  }

  private initTransporter() {
    const host = process.env.SMTP_HOST;
    const port = parseInt(process.env.SMTP_PORT || '587', 10);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !user || !pass) {
      this.logger.warn('SMTP not configured. Email notifications are disabled.');
      return;
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });

    this.logger.log(`Email transporter initialized (${host}:${port})`);
  }

  /**
   * Runs every day at 8:00 AM (server time).
   * Finds users who have LEARNING or REVIEWING words but haven't taken a quiz today.
   */
  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async handleDailyReminder() {
    this.logger.log('Running daily reminder cron job...');

    try {
      const usersToRemind = await this.findUsersNeedingReminder();

      if (usersToRemind.length === 0) {
        this.logger.log('No users need reminders today.');
        return;
      }

      this.logger.log(`Found ${usersToRemind.length} user(s) to send reminders.`);

      for (const user of usersToRemind) {
        await this.sendReminderEmail(user);
      }
    } catch (error) {
      this.logger.error('Daily reminder cron failed:', error);
    }
  }

  /**
   * Find users who have words in LEARNING or REVIEWING status
   * AND have NOT completed a quiz today.
   */
  private async findUsersNeedingReminder(): Promise<UserWithPendingReview[]> {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    // Get all users who have active learning words
    const usersWithActiveWords = await this.prisma.userWord.groupBy({
      by: ['userId'],
      where: {
        status: { in: ['LEARNING', 'REVIEWING'] },
      },
      _count: { id: true },
    });

    if (usersWithActiveWords.length === 0) return [];

    const userIds = usersWithActiveWords.map((u) => u.userId);

    // Exclude users who already took a quiz today
    const usersWithQuizToday = await this.prisma.quiz.findMany({
      where: {
        userId: { in: userIds },
        createdAt: { gte: todayStart },
      },
      select: { userId: true },
      distinct: ['userId'],
    });

    const quizzedUserIds = new Set(usersWithQuizToday.map((q) => q.userId));

    const usersToNotify = usersWithActiveWords.filter(
      (u) => !quizzedUserIds.has(u.userId),
    );

    if (usersToNotify.length === 0) return [];

    // Fetch emails for the users who need reminders
    const users = await this.prisma.user.findMany({
      where: { id: { in: usersToNotify.map((u) => u.userId) } },
      select: { id: true, email: true },
    });

    const userMap = new Map(users.map((u) => [u.id, u.email]));

    return usersToNotify.map((u) => ({
      id: u.userId,
      email: userMap.get(u.userId) || '',
      pendingCount: u._count.id,
    })).filter((u) => u.email);
  }

  private async sendReminderEmail(user: UserWithPendingReview): Promise<void> {
    if (!this.transporter) {
      this.logger.debug(`[Mock] Would send reminder to ${user.email} (${user.pendingCount} words pending)`);
      return;
    }

    try {
      const appName = '5 Words Per Day';
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

      await this.transporter.sendMail({
        from: `"${appName}" <${process.env.SMTP_USER}>`,
        to: user.email,
        subject: `📚 Lời nhắc từ ${appName} — Bạn có ${user.pendingCount} từ đang chờ ôn tập!`,
        html: `
          <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px; background: #f8fafc; border-radius: 16px;">
            <h2 style="color: #1e293b; text-align: center; margin-bottom: 16px;">
              📖 Thời gian ôn tập rồi!
            </h2>
            <p style="color: #475569; font-size: 16px; line-height: 1.6; text-align: center;">
              Bạn có <strong style="color: #4f46e5;">${user.pendingCount} từ vựng</strong> đang ở trạng thái 
              <em>Learning</em> hoặc <em>Reviewing</em> và chưa luyện tập hôm nay.
            </p>
            <div style="text-align: center; margin: 32px 0;">
              <a href="${frontendUrl}/quiz" 
                 style="display: inline-block; padding: 14px 32px; background: #4f46e5; color: #fff; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 16px;">
                Bắt đầu Quiz ngay
              </a>
            </div>
            <p style="color: #94a3b8; font-size: 12px; text-align: center;">
              Nhắc nhở tự động từ ${appName}. Kiên trì mỗi ngày, tiến bộ mỗi ngày! 🚀
            </p>
          </div>
        `,
      });

      this.logger.log(`Reminder email sent to ${user.email}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${user.email}:`, error);
    }
  }
}
