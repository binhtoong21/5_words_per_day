import { config } from 'dotenv';
config();
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const words = [
  // A1
  { word: 'apple', band: 'A1', definitions: [{ partOfSpeech: 'noun', meaning: 'A round fruit with red or green skin.', example: 'I ate a juicy apple.' }] },
  { word: 'book', band: 'A1', definitions: [{ partOfSpeech: 'noun', meaning: 'A written or printed work consisting of pages.', example: 'She is reading a good book.' }] },
  // A2
  { word: 'journey', band: 'A2', definitions: [{ partOfSpeech: 'noun', meaning: 'An act of traveling from one place to another.', example: 'The journey takes about two hours.' }] },
  { word: 'friendly', band: 'A2', definitions: [{ partOfSpeech: 'adjective', meaning: 'Kind and pleasant.', example: 'He gave me a friendly smile.' }] },
  // B1
  { word: 'challenge', band: 'B1', definitions: [{ partOfSpeech: 'noun', meaning: 'A task or situation that tests someone\'s abilities.', example: 'It was a challenge, but we survived.' }] },
  { word: 'discover', band: 'B1', definitions: [{ partOfSpeech: 'verb', meaning: 'Find unexpectedly or during a search.', example: 'They discovered a new species of frog.' }] },
  // B2
  { word: 'crucial', band: 'B2', definitions: [{ partOfSpeech: 'adjective', meaning: 'Decisive or critical, especially in the success or failure of something.', example: 'Negotiations were at a crucial stage.' }] },
  { word: 'implement', band: 'B2', definitions: [{ partOfSpeech: 'verb', meaning: 'Put a decision, plan, agreement, etc. into effect.', example: 'The regulations implement a 1954 treaty.' }] },
  // C1
  { word: 'pragmatic', band: 'C1', definitions: [{ partOfSpeech: 'adjective', meaning: 'Dealing with things sensibly and realistically in a way that is based on practical rather than theoretical considerations.', example: 'She took a pragmatic approach to the problem.' }] },
  { word: 'leverage', band: 'C1', definitions: [{ partOfSpeech: 'verb', meaning: 'Use (something) to maximum advantage.', example: 'The organization needs to leverage its key resources.' }] },
  // C2
  { word: 'ubiquitous', band: 'C2', definitions: [{ partOfSpeech: 'adjective', meaning: 'Present, appearing, or found everywhere.', example: 'His ubiquitous influence was felt by all the family.' }] },
  { word: 'ephemeral', band: 'C2', definitions: [{ partOfSpeech: 'adjective', meaning: 'Lasting for a very short time.', example: 'Fashions are ephemeral.' }] }
];

async function main() {
  console.log('Seeding system dictionary...');
  for (const w of words) {
    await prisma.word.upsert({
      where: { word: w.word },
      update: {},
      create: { 
        word: w.word, 
        band: w.band, 
        definitions: w.definitions 
      }
    });
    console.log(`Seeded: ${w.word}`);
  }
  console.log('Seeding complete.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
