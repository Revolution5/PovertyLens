// Created by Christella - 03/17/2026
// Edited by Christella - 04/15/2026 to add more terms
// Usage: node seedGlossary.js

require('dotenv').config();
const { MongoClient } = require('mongodb');

const MONGO_URI = process.env.CONNECTION_URI;
const DB_NAME   = 'povertylensapp';

// Modified for readability and longer definitions - by Christella - 04/15/2026
const TERMS = [
  // A
  { 
    term: 'Absolute Poverty', 
    letter: 'A', 
    category: 'Economic', 
    definition: 'A severe condition characterized by a total lack of the resources required to meet basic human needs, including safe drinking water, sanitation facilities, health, shelter, and education, regardless of the person’s location.', 
    relatedTerms: ['Relative Poverty', 'Extreme Poverty'] 
  },
  { 
    term: 'Aid', 
    letter: 'A', 
    category: 'Policy', 
    definition: 'The voluntary transfer of resources from one country or organization to another, intended to support economic development, provide disaster relief, or improve the general welfare of a specific population.', 
    relatedTerms: ['Foreign Aid', 'Humanitarian Relief'] 
  },
  { 
    term: 'Austerity', 
    letter: 'A', 
    category: 'Economic', 
    definition: 'A set of economic policies implemented by governments to reduce budget deficits through spending cuts, tax increases, or a combination of both, often leading to a reduction in public services.', 
    relatedTerms: ['Fiscal Policy', 'Social Safety Net'] 
  },
  { 
    term: 'Access to Healthcare', 
    letter: 'A', 
    category: 'Social', 
    definition: 'The ease with which individuals can obtain necessary medical services, influenced by factors such as the availability of facilities, the affordability of care, and the lack of social or physical barriers.', 
    relatedTerms: ['Public Health', 'Human Development'] 
  },
  { 
    term: 'Access to Education', 
    letter: 'A', 
    category: 'Social', 
    definition: 'The ability of all people to participate in quality learning opportunities, which requires the removal of barriers like high tuition costs, lack of infrastructure, and discriminatory social norms.', 
    relatedTerms: ['Education', 'Literacy Rate'] 
  },

  // B
  { 
    term: 'Basic Needs', 
    letter: 'B', 
    category: 'Social', 
    definition: 'The absolute minimum resources necessary for long-term physical well-being, typically categorized into food, water, clothing, shelter, and basic healthcare services.', 
    relatedTerms: ['Absolute Poverty', 'Human Development'] 
  },
  { 
    term: 'Basic Income', 
    letter: 'B', 
    category: 'Policy', 
    definition: 'A periodic, unconditional cash payment delivered to all citizens on an individual basis, intended to provide a financial floor that ensures survival regardless of employment status.', 
    relatedTerms: ['Social Safety Net', 'Cash Transfers'] 
  },

  // C
  { 
    term: 'Cash Transfers', 
    letter: 'C', 
    category: 'Policy', 
    definition: 'Direct payments provided by the state or NGOs to eligible individuals or households, often used as a tool to alleviate poverty by increasing the immediate purchasing power of the poor.', 
    relatedTerms: ['Basic Income', 'Social Safety Net'] 
  },
  { 
    term: 'Child Poverty', 
    letter: 'C', 
    category: 'Social', 
    definition: 'The state of children living in families with income below the poverty line, which often restricts their physical development and limits their future educational and economic opportunities.', 
    relatedTerms: ['Absolute Poverty', 'Education'] 
  },
  { 
    term: 'Community Development', 
    letter: 'C', 
    category: 'Social', 
    definition: 'A process where community members come together to take collective action and generate solutions to common problems, focusing on improving social, economic, and environmental conditions.', 
    relatedTerms: ['Grassroots', 'Empowerment'] 
  },
  { 
    term: 'Cycle of Poverty', 
    letter: 'C', 
    category: 'Economic', 
    definition: 'A phenomenon where poor families remain trapped in poverty for at least three generations due to a lack of resources, such as capital, education, and social connections, needed to escape.', 
    relatedTerms: ['Poverty Trap', 'Structural Poverty'] 
  },
  { 
    term: 'Cost of Living', 
    letter: 'C', 
    category: 'Economic', 
    definition: 'The average cost of maintaining a certain standard of living, including essential expenses such as housing, food, taxes, and healthcare in a specific geographic area.', 
    relatedTerms: ['Living Wage', 'Income Gap'] 
  },
  { 
    term: 'Child Labor', 
    letter: 'C', 
    category: 'Social', 
    definition: 'Work that is mentally, physically, socially, or morally dangerous to children, interfering with their schooling by depriving them of the opportunity to attend or stay in school.', 
    relatedTerms: ['Education', 'Labor Rights'] 
  },

  // D
  { 
    term: 'Debt Trap', 
    letter: 'D', 
    category: 'Economic', 
    definition: 'A situation in which a borrower is forced to take out new loans to pay off existing ones, often due to high interest rates, leading to a cycle of debt that is nearly impossible to escape.', 
    relatedTerms: ['Microcredit', 'Financial Inclusion'] 
  },
  { 
    term: 'Displacement', 
    letter: 'D', 
    category: 'Social', 
    definition: 'The forced movement of people from their locality or environment and occupational activities, often caused by conflict, natural disasters, or large-scale development projects.', 
    relatedTerms: ['Refugee', 'Humanitarian Relief'] 
  },
  { 
    term: 'Development', 
    letter: 'D', 
    category: 'Economic', 
    definition: 'The process of improving the economic, political, and social well-being of a nation’s people through targeted investments in infrastructure, industry, and human services.', 
    relatedTerms: ['Infrastructure', 'Human Development'] 
  },
  { 
    term: 'Digital Divide', 
    letter: 'D', 
    category: 'Social', 
    definition: 'The gap between demographics and regions that have access to modern information and communication technology and those that don’t or have restricted access.', 
    relatedTerms: ['Education', 'Infrastructure'] 
  },

  // E
  { 
    term: 'Economic Inequality', 
    letter: 'E', 
    category: 'Economic', 
    definition: 'The unequal distribution of income and opportunity between different groups in society, often measured by the concentration of wealth in a small percentage of the population.', 
    relatedTerms: ['Gini Coefficient', 'Wealth Gap'] 
  },
  { 
    term: 'Education', 
    letter: 'E', 
    category: 'Social', 
    definition: 'The systematic process of receiving or giving instruction, which serves as a primary tool for social mobility by equipping individuals with necessary life skills and knowledge.', 
    relatedTerms: ['Human Capital', 'Child Poverty'] 
  },
  { 
    term: 'Empowerment', 
    letter: 'E', 
    category: 'Social', 
    definition: 'The process of becoming stronger and more confident, especially in controlling one’s life and claiming one’s rights, often achieved through education and social participation.', 
    relatedTerms: ['Community Development', 'Gender Equality'] 
  },
  { 
    term: 'Extreme Poverty', 
    letter: 'E', 
    category: 'Economic', 
    definition: 'A condition defined by the World Bank as living on less than $2.15 per day, where a person cannot afford even the most basic necessities for survival.', 
    relatedTerms: ['Absolute Poverty', 'Global Poverty Line'] 
  },
  { 
    term: 'Economic Mobility', 
    letter: 'E', 
    category: 'Economic', 
    definition: 'The ability of an individual or family to improve their economic status, usually measured by movement between income quintiles over a lifetime or across generations.', 
    relatedTerms: ['Social Mobility', 'Income Gap'] 
  },
  { 
    term: 'Employment Security', 
    letter: 'E', 
    category: 'Economic', 
    definition: 'The probability that an individual will keep their job and maintain a steady income, which is often threatened by market fluctuations and a lack of labor protections.', 
    relatedTerms: ['Unemployment', 'Underemployment'] 
  },
  { 
    term: 'Eviction', 
    letter: 'E', 
    category: 'Social', 
    definition: 'The legal process of removing a tenant from rental property by a landlord, which is a major driver of homelessness and housing instability for low-income families.', 
    relatedTerms: ['Housing Instability', 'Homelessness'] 
  },

  // F
  { 
    term: 'Famine', 
    letter: 'F', 
    category: 'Humanitarian', 
    definition: 'An extreme scarcity of food that causes widespread hunger, malnutrition, and increased mortality rates across a large geographic area or population.', 
    relatedTerms: ['Food Insecurity', 'Humanitarian Relief'] 
  },
  { 
    term: 'Financial Inclusion', 
    letter: 'F', 
    category: 'Economic', 
    definition: 'The effort to provide individuals and businesses with access to useful and affordable financial products and services, such as banking, insurance, and credit.', 
    relatedTerms: ['Microcredit', 'Debt Trap'] 
  },
  { 
    term: 'Food Insecurity', 
    letter: 'F', 
    category: 'Humanitarian', 
    definition: 'The state of being without reliable access to a sufficient quantity of affordable, nutritious food, often leading to poor health outcomes and developmental delays.', 
    relatedTerms: ['Famine', 'Malnutrition'] 
  },
  { 
    term: 'Foreign Aid', 
    letter: 'F', 
    category: 'Policy', 
    definition: 'International transfer of capital, goods, or services from a country or international organization for the benefit of the recipient country or its population.', 
    relatedTerms: ['Aid', 'Development Assistance'] 
  },
  { 
    term: 'Fair Trade', 
    letter: 'F', 
    category: 'Economic', 
    definition: 'A global movement that encourages ethical trading relationships, ensuring that producers in developing countries receive fair prices and work in safe conditions.', 
    relatedTerms: ['Globalization', 'Labor Rights'] 
  },
  { 
    term: 'Food Desert', 
    letter: 'F', 
    category: 'Social', 
    definition: 'An urban or rural area where it is difficult to buy affordable or good-quality fresh food, often due to a lack of grocery stores or healthy food providers.', 
    relatedTerms: ['Food Insecurity', 'Nutrition'] 
  },

  // G
  { 
    term: 'Gender Equality', 
    letter: 'G', 
    category: 'Social', 
    definition: 'The state in which access to rights or opportunities is unaffected by gender, ensuring that women and men have equal power to shape their lives and contribute to society.', 
    relatedTerms: ['Empowerment', 'Education'] 
  },
  { 
    term: 'Gini Coefficient', 
    letter: 'G', 
    category: 'Economic', 
    definition: 'A statistical measure of distribution often used as a gauge of economic inequality, measuring income distribution or wealth distribution among a population.', 
    relatedTerms: ['Economic Inequality', 'Wealth Gap'] 
  },
  { 
    term: 'Global Poverty Line', 
    letter: 'G', 
    category: 'Economic', 
    definition: 'The threshold used to measure the number of people living in extreme poverty worldwide, adjusted for purchasing power differences across different countries.', 
    relatedTerms: ['Extreme Poverty'] 
  },
  { 
    term: 'Grassroots', 
    letter: 'G', 
    category: 'Social', 
    definition: 'Social or political movements that use the people in a given district, region, or community as the basis for a political or economic movement.', 
    relatedTerms: ['Community Development'] 
  },
  { 
    term: 'Gig Economy', 
    letter: 'G', 
    category: 'Economic', 
    definition: 'A labor market characterized by the prevalence of short-term contracts or freelance work as opposed to permanent jobs, often lacking traditional benefits and job security.', 
    relatedTerms: ['Underemployment'] 
  },
  { 
    term: 'Globalization', 
    letter: 'G', 
    category: 'Economic', 
    definition: 'The process by which businesses or other organizations develop international influence or start operating on an international scale, affecting local labor markets and economies.', 
    relatedTerms: ['Development'] 
  },

  // H
  { 
    term: 'Human Capital', 
    letter: 'H', 
    category: 'Economic', 
    definition: 'The collective skills, knowledge, or other intangible assets of individuals that can be used to create economic value for the individuals, their employers, or their community.', 
    relatedTerms: ['Education'] 
  },
  { 
    term: 'Human Development', 
    letter: 'H', 
    category: 'Social', 
    definition: 'A developmental approach that focuses on improving the lives people lead rather than assuming that economic growth will lead, automatically, to greater wellbeing for all.', 
    relatedTerms: ['Basic Needs'] 
  },
  { 
    term: 'Humanitarian Relief', 
    letter: 'H', 
    category: 'Humanitarian', 
    definition: 'Material and logisitical assistance provided for humanitarian purposes, typically in response to crises such as natural disasters, man-made disasters, or conflict.', 
    relatedTerms: ['Aid'] 
  },
  { 
    term: 'Homelessness', 
    letter: 'H', 
    category: 'Social', 
    definition: 'The condition of people without a permanent dwelling, such as people living in on the streets, in shelters, or in other temporary and unstable housing situations.', 
    relatedTerms: ['Housing Instability'] 
  },
  { 
    term: 'Housing Instability', 
    letter: 'H', 
    category: 'Social', 
    definition: 'A broad term that includes a number of challenges such as having trouble paying rent, overcrowding, moving frequently, or spending a large portion of income on housing.', 
    relatedTerms: ['Homelessness'] 
  },

  // I
  { 
    term: 'Income Gap', 
    letter: 'I', 
    category: 'Economic', 
    definition: 'The difference between the income of the rich and the poor, or between different social groups, reflecting the level of inequality within a specific economy.', 
    relatedTerms: ['Economic Inequality'] 
  },
  { 
    term: 'Infrastructure', 
    letter: 'I', 
    category: 'Economic', 
    definition: 'The basic physical and organizational structures and facilities, such as buildings, roads, and power supplies, needed for the operation of a society or enterprise.', 
    relatedTerms: ['Development'] 
  },
  { 
    term: 'Informal Economy', 
    letter: 'I', 
    category: 'Economic', 
    definition: 'The part of an economy that is neither taxed nor monitored by any form of government, often providing a survival mechanism for those unable to find formal employment.', 
    relatedTerms: ['Underemployment'] 
  },
  { 
    term: 'Intergenerational Poverty', 
    letter: 'I', 
    category: 'Economic', 
    definition: 'A situation where poverty is passed from one generation to the next, often because the children lack the education and health resources to improve their economic status.', 
    relatedTerms: ['Cycle of Poverty'] 
  },
  { 
    term: 'Income Inequality', 
    letter: 'I', 
    category: 'Economic', 
    definition: 'The significant disparity in how total income is distributed among individuals, groups, or nations, often leading to social tension and reduced economic mobility.', 
    relatedTerms: ['Economic Inequality'] 
  },

  // L
  { 
    term: 'Living Wage', 
    letter: 'L', 
    category: 'Economic', 
    definition: 'The minimum income necessary for a worker to meet their basic needs and maintain a decent standard of living, which is often higher than the legal minimum wage.', 
    relatedTerms: ['Minimum Wage'] 
  },
  { 
    term: 'Livelihood', 
    letter: 'L', 
    category: 'Social', 
    definition: 'A person’s "means of securing the necessities of life," encompassing the capabilities, assets, and activities required to make a living and sustain one\'s well-being.', 
    relatedTerms: ['Working Poor'] 
  },
  { 
    term: 'Labor Rights', 
    letter: 'L', 
    category: 'Policy', 
    definition: 'The legal rights and human rights relating to labor relations between workers and employers, including the right to safe conditions, fair pay, and collective bargaining.', 
    relatedTerms: ['Minimum Wage'] 
  },
  { 
    term: 'Life Expectancy', 
    letter: 'L', 
    category: 'Social', 
    definition: 'The statistical measure of the average time an organism is expected to live, which is highly influenced by access to nutrition, healthcare, and safe living environments.', 
    relatedTerms: ['Human Development'] 
  },
  { 
    term: 'Literacy Rate', 
    letter: 'L', 
    category: 'Social', 
    definition: 'The percentage of the population aged 15 and above who can both read and write with understanding a short simple statement about their everyday life.', 
    relatedTerms: ['Education'] 
  },

  // M
  { 
    term: 'Malnutrition', 
    letter: 'M', 
    category: 'Humanitarian', 
    definition: 'A condition that results from eating a diet in which nutrients are either not enough or are too much such that the diet causes health problems, common in poverty-stricken areas.', 
    relatedTerms: ['Food Insecurity'] 
  },
  { 
    term: 'Microcredit', 
    letter: 'M', 
    category: 'Economic', 
    definition: 'The lending of small amounts of money at low interest to new businesses in the developing world or to individuals who lack collateral or a verifiable credit history.', 
    relatedTerms: ['Financial Inclusion'] 
  },
  { 
    term: 'Minimum Wage', 
    letter: 'M', 
    category: 'Policy', 
    definition: 'The lowest remuneration that employers can legally pay their workers; the price floor below which workers may not sell their labor.', 
    relatedTerms: ['Living Wage'] 
  },
  { 
    term: 'Marginalization', 
    letter: 'M', 
    category: 'Social', 
    definition: 'The social process of becoming or being made marginal (relegated to the fringe of society), resulting in a lack of access to resources and decision-making power.', 
    relatedTerms: ['Structural Poverty'] 
  },
  { 
    term: 'Migration', 
    letter: 'M', 
    category: 'Social', 
    definition: 'The movement of people from one place to another with the intentions of settling, permanently or temporarily, often driven by the search for better economic opportunities.', 
    relatedTerms: ['Refugee'] 
  },

  // N
  { 
    term: 'Nonprofit Organization', 
    letter: 'N', 
    category: 'Social', 
    definition: 'An organization that uses its surplus revenues to further achieve its ultimate objective, rather than distributing its income to the organization\'s shareholders or leaders.', 
    relatedTerms: ['Aid'] 
  },
  { 
    term: 'Nutrition', 
    letter: 'N', 
    category: 'Humanitarian', 
    definition: 'The biochemical and physiological process by which an organism uses food to support its life, which is a critical pillar of health and human development.', 
    relatedTerms: ['Food Insecurity'] 
  },

  // O
  { 
    term: 'Overcrowding', 
    letter: 'O', 
    category: 'Social', 
    definition: 'A situation in which more people are living within a single dwelling than is healthy or safe, often a result of high housing costs and lack of affordable alternatives.', 
    relatedTerms: ['Urban Poverty'] 
  },

  // P
  { 
    term: 'Poverty Line', 
    letter: 'P', 
    category: 'Economic', 
    definition: 'The minimum level of income deemed adequate in a particular country; people living below this line are considered to be in a state of poverty.', 
    relatedTerms: ['Absolute Poverty'] 
  },
  { 
    term: 'Poverty Trap', 
    letter: 'P', 
    category: 'Economic', 
    definition: 'A mechanism which makes it very difficult for people to escape poverty, often created by a lack of capital, poor education, or government systems that penalize earning more.', 
    relatedTerms: ['Cycle of Poverty'] 
  },
  { 
    term: 'Purchasing Power Parity', 
    letter: 'P', 
    category: 'Economic', 
    definition: 'An economic theory that allows the comparison of the purchasing power of various world currencies to each other, used to adjust poverty measurements globally.', 
    relatedTerms: ['Global Poverty Line'] 
  },
  { 
    term: 'Public Health', 
    letter: 'P', 
    category: 'Social', 
    definition: 'The science and art of preventing disease, prolonging life, and promoting health through organized efforts and informed choices of society and communities.', 
    relatedTerms: ['Healthcare'] 
  },

  // R
  { 
    term: 'Refugee', 
    letter: 'R', 
    category: 'Humanitarian', 
    definition: 'A person who has been forced to leave their country in order to escape war, persecution, or natural disaster, and is seeking safety in another nation.', 
    relatedTerms: ['Displacement'] 
  },
  { 
    term: 'Relative Poverty', 
    letter: 'R', 
    category: 'Economic', 
    definition: 'The condition in which people lack the minimum amount of income needed in order to maintain the average standard of living in the society in which they live.', 
    relatedTerms: ['Absolute Poverty'] 
  },
  { 
    term: 'Remittances', 
    letter: 'R', 
    category: 'Economic', 
    definition: 'Money sent by a person in a foreign land to their home country, which often serves as a vital source of income for families in developing nations.', 
    relatedTerms: ['Migration'] 
  },
  { 
    term: 'Resilience', 
    letter: 'R', 
    category: 'Social', 
    definition: 'The capacity of individuals, communities, and systems to survive, adapt, and grow in the face of stress and shocks, such as economic downturns or disasters.', 
    relatedTerms: ['Empowerment'] 
  },
  { 
    term: 'Rural Poverty', 
    letter: 'R', 
    category: 'Social', 
    definition: 'Poverty found in non-urban areas, often characterized by a lack of access to infrastructure, limited employment options, and a heavy reliance on subsistence agriculture.', 
    relatedTerms: ['Urban Poverty'] 
  },

  // S
  { 
    term: 'Slum', 
    letter: 'S', 
    category: 'Social', 
    definition: 'A highly populated urban residential area consisting mostly of closely packed, decrepit housing units in a situation of deteriorated or incomplete infrastructure.', 
    relatedTerms: ['Urban Poverty'] 
  },
  { 
    term: 'Safety Net', 
    letter: 'S', 
    category: 'Policy', 
    definition: 'A collection of services provided by the state or other institutions which prevent individuals from falling into poverty beyond a certain level.', 
    relatedTerms: ['Cash Transfers'] 
  },
  { 
    term: 'Sanitation', 
    letter: 'S', 
    category: 'Social', 
    definition: 'Public health conditions related to clean drinking water and adequate treatment and disposal of human excreta and sewage, essential for preventing disease.', 
    relatedTerms: ['Basic Needs'] 
  },
  { 
    term: 'Social Mobility', 
    letter: 'S', 
    category: 'Social', 
    definition: 'The movement of individuals, families, or groups through a system of social hierarchy or stratification, such as moving from a lower to a higher income bracket.', 
    relatedTerms: ['Economic Inequality'] 
  },
  { 
    term: 'Structural Poverty', 
    letter: 'S', 
    category: 'Economic', 
    definition: 'Poverty that is the result of a lack of opportunities and resources in a society’s system, rather than the result of an individual\'s choices or abilities.', 
    relatedTerms: ['Poverty Trap'] 
  },
  { 
    term: 'Subsistence', 
    letter: 'S', 
    category: 'Economic', 
    definition: 'The action or fact of maintaining or supporting oneself at a minimum level, typically referring to farming or income that barely covers survival needs.', 
    relatedTerms: ['Absolute Poverty'] 
  },
  { 
    term: 'Subsidy', 
    letter: 'S', 
    category: 'Policy', 
    definition: 'A sum of money granted by the government or a public body to assist an industry or business so that the price of a commodity or service may remain low or competitive.', 
    relatedTerms: ['Aid'] 
  },
  { 
    term: 'Sustainable Development', 
    letter: 'S', 
    category: 'Economic', 
    definition: 'Economic development that is conducted without depletion of natural resources, ensuring that the needs of the present are met without compromising the future generations.', 
    relatedTerms: ['Development'] 
  },

  // U
  { 
    term: 'Underemployment', 
    letter: 'U', 
    category: 'Economic', 
    definition: 'A measure of employment and labor utilization in the economy that looks at how well the labor force is being used in terms of skills, experience, and availability to work.', 
    relatedTerms: ['Unemployment'] 
  },
  { 
    term: 'Unemployment', 
    letter: 'U', 
    category: 'Economic', 
    definition: 'The state of being without any paid work despite being able and willing to work and actively seeking a job, used as a key indicator of economic health.', 
    relatedTerms: ['Underemployment'] 
  },
  { 
    term: 'Urbanization', 
    letter: 'U', 
    category: 'Social', 
    definition: 'The process by which more and more people leave the countryside to live in cities, which can lead to increased urban poverty if infrastructure does not keep pace.', 
    relatedTerms: ['Urban Poverty'] 
  },
  { 
    term: 'Urban Poverty', 
    letter: 'U', 
    category: 'Social', 
    definition: 'A set of economic and social difficulties found in industrialized cities, often manifesting as lack of access to jobs, housing, and social services despite being in a city.', 
    relatedTerms: ['Slum'] 
  },

  // V
  { 
    term: 'Vulnerability', 
    letter: 'V', 
    category: 'Social', 
    definition: 'The quality or state of being exposed to the possibility of being attacked or harmed, either physically or emotionally, often due to lack of financial or social protection.', 
    relatedTerms: ['Resilience'] 
  },

  // W
  { 
    term: 'Wealth Gap', 
    letter: 'W', 
    category: 'Economic', 
    definition: 'The unequal distribution of assets among residents of a particular country, including stocks, bonds, savings, and real estate, rather than just annual income.', 
    relatedTerms: ['Economic Inequality'] 
  },
  { 
    term: 'Working Poor', 
    letter: 'W', 
    category: 'Economic', 
    definition: 'People who spend at least 27 weeks in the labor force but whose incomes still fall below the official poverty level, highlighting the inadequacy of low-wage work.', 
    relatedTerms: ['Living Wage'] 
  },
  { 
    term: 'Welfare', 
    letter: 'W', 
    category: 'Policy', 
    definition: 'Statutory procedure or social effort designed to promote the basic physical and material well-being of people in need through government programs.', 
    relatedTerms: ['Safety Net'] 
  },
  { 
    term: 'Workforce Development', 
    letter: 'W', 
    category: 'Economic', 
    definition: 'A coordination of public and private sector policies and programs that provides individuals with the opportunity for a sustainable livelihood and helps businesses thrive.', 
    relatedTerms: ['Human Capital'] 
  },
];

async function seed() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  const db = client.db(DB_NAME);

  await db.collection('glossary').deleteMany({});
  const result = await db.collection('glossary').insertMany(TERMS);
  console.log(`Seeded ${result.insertedCount} glossary terms.`);

  await db.collection('glossary').createIndex({ letter: 1 });
  await db.collection('glossary').createIndex({ term: 'text', definition: 'text' });

  await client.close();
}

seed().catch(console.error);