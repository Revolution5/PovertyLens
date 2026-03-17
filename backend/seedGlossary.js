// Created by Christella - 03/17/2026
// Run once to seed the glossary collection with starter terms.
// Usage: node seedGlossary.js

const { MongoClient } = require('mongodb');

const MONGO_URI = process.env.CONNECTION_URI || process.env.MONGO_URI || 'mongodb+srv://taguicanachristellamarie_db_user:UOtwmmHxWYbQMQqu@povertylenscluster.nnimjxi.mongodb.net/povertylens';
const DB_NAME   = 'povertylensapp';

const TERMS = [
  // A
  { term: 'Absolute Poverty',       letter: 'A', category: 'Economic',   definition: 'A condition where a person lacks the minimum income necessary to meet basic survival needs such as food, shelter, and clothing.', relatedTerms: ['Relative Poverty', 'Extreme Poverty'] },
  { term: 'Aid',                    letter: 'A', category: 'Policy',     definition: 'Resources such as money, food, or goods provided by governments, organizations, or individuals to people in need.', relatedTerms: ['Foreign Aid', 'Humanitarian Relief'] },
  { term: 'Austerity',              letter: 'A', category: 'Economic',   definition: 'Government policies that reduce public spending and social services, often implemented to reduce budget deficits.', relatedTerms: ['Fiscal Policy', 'Social Safety Net'] },
  // B
  { term: 'Basic Needs',            letter: 'B', category: 'Social',     definition: 'The fundamental requirements for human survival and wellbeing, including food, clean water, shelter, sanitation, and healthcare.', relatedTerms: ['Absolute Poverty', 'Human Development'] },
  { term: 'Basic Income',           letter: 'B', category: 'Policy',     definition: 'A universal, unconditional regular cash payment made to all individuals regardless of income or employment status.', relatedTerms: ['Social Safety Net', 'Cash Transfers'] },
  // C
  { term: 'Cash Transfers',         letter: 'C', category: 'Policy',     definition: 'Direct payments of money to individuals or households, often used as a social protection tool to reduce poverty.', relatedTerms: ['Basic Income', 'Social Safety Net'] },
  { term: 'Child Poverty',          letter: 'C', category: 'Social',     definition: 'The condition in which children live in households that lack the financial resources to meet basic needs.', relatedTerms: ['Absolute Poverty', 'Education'] },
  { term: 'Community Development',  letter: 'C', category: 'Social',     definition: 'A process where community members work collectively to improve social, economic, and environmental conditions in their area.', relatedTerms: ['Grassroots', 'Empowerment'] },
  // D
  { term: 'Debt Trap',              letter: 'D', category: 'Economic',   definition: 'A situation in which a borrower cannot repay a loan and is forced to take on additional debt, creating a cycle of increasing debt.', relatedTerms: ['Microcredit', 'Financial Inclusion'] },
  { term: 'Displacement',           letter: 'D', category: 'Social',     definition: 'The forced movement of people from their homes or communities due to conflict, disaster, or other external forces.', relatedTerms: ['Refugee', 'Humanitarian Relief'] },
  // E
  { term: 'Economic Inequality',    letter: 'E', category: 'Economic',   definition: 'The unequal distribution of income and wealth among individuals or groups within a society.', relatedTerms: ['Gini Coefficient', 'Wealth Gap'] },
  { term: 'Education',              letter: 'E', category: 'Social',     definition: 'Access to learning opportunities that build skills and knowledge, widely considered a key pathway out of poverty.', relatedTerms: ['Human Capital', 'Child Poverty'] },
  { term: 'Empowerment',            letter: 'E', category: 'Social',     definition: 'The process of increasing the capacity of individuals or groups to make choices and take actions that lead to desired outcomes.', relatedTerms: ['Community Development', 'Gender Equality'] },
  { term: 'Extreme Poverty',        letter: 'E', category: 'Economic',   definition: 'Living on less than $2.15 per day (the World Bank threshold), meaning a person cannot meet basic needs for survival.', relatedTerms: ['Absolute Poverty', 'Global Poverty Line'] },
  // F
  { term: 'Famine',                 letter: 'F', category: 'Humanitarian', definition: 'A severe shortage of food affecting a large population, resulting in widespread hunger, malnutrition, and death.', relatedTerms: ['Food Insecurity', 'Humanitarian Relief'] },
  { term: 'Financial Inclusion',    letter: 'F', category: 'Economic',   definition: 'Efforts to ensure individuals and businesses have access to affordable financial products and services such as banking and credit.', relatedTerms: ['Microcredit', 'Debt Trap'] },
  { term: 'Food Insecurity',        letter: 'F', category: 'Humanitarian', definition: 'A lack of consistent access to enough food for an active, healthy life.', relatedTerms: ['Famine', 'Malnutrition'] },
  { term: 'Foreign Aid',            letter: 'F', category: 'Policy',     definition: 'Money, goods, or services provided by one country to another to support development, humanitarian efforts, or political goals.', relatedTerms: ['Aid', 'Development Assistance'] },
  // G
  { term: 'Gender Equality',        letter: 'G', category: 'Social',     definition: 'Equal rights, responsibilities, and opportunities for people of all genders, closely linked to poverty reduction.', relatedTerms: ['Empowerment', 'Education'] },
  { term: 'Gini Coefficient',       letter: 'G', category: 'Economic',   definition: 'A statistical measure of income or wealth distribution within a population, where 0 is perfect equality and 1 is total inequality.', relatedTerms: ['Economic Inequality', 'Wealth Gap'] },
  { term: 'Global Poverty Line',    letter: 'G', category: 'Economic',   definition: 'An international benchmark (currently $2.15/day, set by the World Bank) used to measure extreme poverty across countries.', relatedTerms: ['Extreme Poverty', 'Purchasing Power Parity'] },
  { term: 'Grassroots',             letter: 'G', category: 'Social',     definition: 'Movements or organizations driven by ordinary community members rather than top-down institutions.', relatedTerms: ['Community Development', 'Empowerment'] },
  // H
  { term: 'Human Capital',          letter: 'H', category: 'Economic',   definition: 'The skills, knowledge, and experience possessed by individuals that have economic value and contribute to productivity.', relatedTerms: ['Education', 'Workforce Development'] },
  { term: 'Human Development',      letter: 'H', category: 'Social',     definition: 'A framework that measures wellbeing beyond income, including health, education, and standard of living.', relatedTerms: ['HDI', 'Basic Needs'] },
  { term: 'Humanitarian Relief',    letter: 'H', category: 'Humanitarian', definition: 'Emergency assistance provided to people affected by crises such as conflict, famine, or natural disasters.', relatedTerms: ['Aid', 'Displacement', 'Famine'] },
  // I
  { term: 'Income Gap',             letter: 'I', category: 'Economic',   definition: 'The difference in earnings between the highest and lowest income groups in a society.', relatedTerms: ['Economic Inequality', 'Gini Coefficient'] },
  { term: 'Infrastructure',         letter: 'I', category: 'Economic',   definition: 'Basic physical systems including roads, utilities, and communication networks that support economic activity and quality of life.', relatedTerms: ['Development', 'Basic Needs'] },
  // L
  { term: 'Living Wage',            letter: 'L', category: 'Economic',   definition: 'The minimum income necessary for a worker to meet their basic needs, typically higher than the legal minimum wage.', relatedTerms: ['Minimum Wage', 'Working Poor'] },
  { term: 'Livelihood',             letter: 'L', category: 'Social',     definition: 'The means by which a person earns income and supports themselves and their family, often used in development contexts.', relatedTerms: ['Working Poor', 'Empowerment'] },
  // M
  { term: 'Malnutrition',           letter: 'M', category: 'Humanitarian', definition: 'A condition resulting from inadequate or imbalanced nutrition, including both undernutrition and overnutrition.', relatedTerms: ['Food Insecurity', 'Famine'] },
  { term: 'Microcredit',            letter: 'M', category: 'Economic',   definition: 'Small loans made to low-income individuals who lack access to traditional banking services, intended to support entrepreneurship.', relatedTerms: ['Financial Inclusion', 'Debt Trap'] },
  { term: 'Minimum Wage',           letter: 'M', category: 'Policy',     definition: 'The lowest legal hourly pay that employers are required to pay workers, set by government regulation.', relatedTerms: ['Living Wage', 'Working Poor'] },
  // P
  { term: 'Poverty Line',           letter: 'P', category: 'Economic',   definition: 'The minimum level of income deemed adequate to meet basic living standards, used to measure poverty rates.', relatedTerms: ['Absolute Poverty', 'Global Poverty Line'] },
  { term: 'Poverty Trap',           letter: 'P', category: 'Economic',   definition: 'A self-reinforcing cycle in which poverty persists because low income prevents investment in education, health, or capital.', relatedTerms: ['Cycle of Poverty', 'Absolute Poverty'] },
  { term: 'Purchasing Power Parity', letter: 'P', category: 'Economic', definition: 'An economic theory that compares the relative value of currencies by equalizing the prices of a basket of goods across countries.', relatedTerms: ['Global Poverty Line', 'Economic Inequality'] },
  // R
  { term: 'Refugee',                letter: 'R', category: 'Humanitarian', definition: 'A person who has been forced to leave their country in order to escape war, persecution, or natural disaster.', relatedTerms: ['Displacement', 'Humanitarian Relief'] },
  { term: 'Relative Poverty',       letter: 'R', category: 'Economic',   definition: 'A condition in which a household\'s income is significantly below the median income of the society in which they live.', relatedTerms: ['Absolute Poverty', 'Income Gap'] },
  // S
  { term: 'Safety Net',             letter: 'S', category: 'Policy',     definition: 'Government programs and services that provide a minimum level of support to people who are unable to meet their basic needs.', relatedTerms: ['Cash Transfers', 'Basic Income'] },
  { term: 'Sanitation',             letter: 'S', category: 'Social',     definition: 'Access to clean water, proper waste disposal, and hygiene facilities, critical to health and poverty reduction.', relatedTerms: ['Basic Needs', 'Infrastructure'] },
  { term: 'Social Mobility',        letter: 'S', category: 'Social',     definition: 'The ability of individuals or families to move between economic classes over time, upward or downward.', relatedTerms: ['Economic Inequality', 'Education'] },
  { term: 'Structural Poverty',     letter: 'S', category: 'Economic',   definition: 'Poverty caused by systemic factors such as discrimination, lack of access to resources, or unjust economic systems rather than individual circumstances.', relatedTerms: ['Poverty Trap', 'Cycle of Poverty'] },
  { term: 'Subsistence',            letter: 'S', category: 'Economic',   definition: 'The minimum level of resources required to maintain life, often used to describe farming or living that produces just enough to survive.', relatedTerms: ['Absolute Poverty', 'Basic Needs'] },
  // U
  { term: 'Underemployment',        letter: 'U', category: 'Economic',   definition: 'A condition in which workers are employed below their skill level, part-time against their will, or in jobs with insufficient pay.', relatedTerms: ['Working Poor', 'Unemployment'] },
  { term: 'Unemployment',           letter: 'U', category: 'Economic',   definition: 'The state of being without paid work while actively seeking employment.', relatedTerms: ['Underemployment', 'Working Poor'] },
  { term: 'Urban Poverty',          letter: 'U', category: 'Social',     definition: 'Poverty experienced in cities and towns, often associated with informal housing, limited services, and high cost of living.', relatedTerms: ['Slum', 'Structural Poverty'] },
  // W
  { term: 'Wealth Gap',             letter: 'W', category: 'Economic',   definition: 'The disparity in accumulated assets between the richest and poorest segments of a population.', relatedTerms: ['Economic Inequality', 'Gini Coefficient'] },
  { term: 'Working Poor',           letter: 'W', category: 'Economic',   definition: 'Individuals who are employed but still earn wages below the poverty line, unable to meet basic needs despite working.', relatedTerms: ['Living Wage', 'Minimum Wage', 'Underemployment'] },
];

async function seed() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  const db = client.db(DB_NAME);

  // Clear existing terms and re-seed
  await db.collection('glossary').deleteMany({});
  const result = await db.collection('glossary').insertMany(TERMS);
  console.log(`Seeded ${result.insertedCount} glossary terms.`);

  // Create indexes for fast lookup
  await db.collection('glossary').createIndex({ letter: 1 });
  await db.collection('glossary').createIndex({ term: 'text', definition: 'text' });
  await db.collection('glossaryUserData').createIndex({ userEmail: 1, termId: 1 }, { unique: true });
  console.log('Indexes created.');

  await client.close();
}

seed().catch(console.error);
// End of creation by Christella - 03/17/2026