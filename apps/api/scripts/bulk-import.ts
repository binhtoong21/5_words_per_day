import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Sử dụng nguồn dữ liệu Oxford 5000 JSON từ GitHub mở
const DATASET_URL = 'https://raw.githubusercontent.com/winterdl/oxford-5000-vocabulary-audio-definition/master/data/oxford_5000.json';

async function main() {
  console.log(`Đang tải dữ liệu Oxford 5000 từ: ${DATASET_URL}...`);
  try {
    const response = await fetch(DATASET_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.statusText}`);
    }
    const data: any = await response.json();
    
    const wordsToInsert = Array.isArray(data) ? data : Object.values(data);
    console.log(`Tải thành công ${wordsToInsert.length} từ vựng. Đang tiến hành import vào Database...`);
    
    let insertedCount = 0;
    
    for (const item of wordsToInsert) {
      if (!item.word) continue;
      
      // Lấy cấp độ (band) từ definition đầu tiên, mặc định là A1 nếu không có
      let band = 'A1';
      let mappedDefinitions = [];
      
      if (Array.isArray(item.definitions) && item.definitions.length > 0) {
        band = item.definitions[0].level || 'A1';
        
        // Map chuẩn cấu trúc Json cho database
        mappedDefinitions = item.definitions.map((def: any) => ({
          partOfSpeech: def.type || 'unknown',
          meaning: def.text || '',
          example: [] // Data này có thể không có ví dụ cụ thể, mảng rỗng tạm thời
        }));
      }
      
      // Upsert: Nếu từ đã tồn tại thì bỏ qua (update rỗng), nếu chưa thì tạo mới
      await prisma.word.upsert({
        where: { word: item.word.toLowerCase() },
        update: {},
        create: {
          word: item.word.toLowerCase(),
          band: band,
          phonetic: item.phonetic || null,
          definitions: mappedDefinitions
        }
      });
      
      insertedCount++;
      if (insertedCount % 500 === 0) {
        console.log(`Đã import ${insertedCount} từ...`);
      }
    }
    
    console.log(`✅ Import hoàn tất. Đã thêm tổng cộng ${insertedCount} từ vựng vào hệ thống.`);
  } catch (error) {
    console.error('❌ Lỗi trong quá trình import:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
