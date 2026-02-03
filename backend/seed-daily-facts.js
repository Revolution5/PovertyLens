// Script to seed daily facts into the database
// Run with: node seed-daily-facts.js

const facts = [
  {
    title: "Global Poverty Today",
    text: "As of 2023, approximately 735 million people live in extreme poverty (living on less than $1.90 per day), down from 1.9 billion in 1990. While progress has been made, ending poverty remains a critical global challenge."
  },
  {
    title: "The Poverty Line",
    text: "The World Bank defines extreme poverty as living on less than $1.90 per day, while moderate poverty is living on less than $3.20 per day. These thresholds help measure and track progress in reducing global poverty."
  },
  {
    title: "Education & Poverty",
    text: "Children from low-income families are 4 times more likely to drop out of school. Education is one of the most powerful tools to break the cycle of poverty and improve future opportunities."
  },
  {
    title: "Gender & Poverty",
    text: "Women and girls make up a disproportionate share of the world's poor. Gender inequality, limited access to education, and economic discrimination perpetuate cycles of poverty for millions of women worldwide."
  },
  {
    title: "Hunger & Poverty",
    text: "Over 700 million people suffer from hunger today. The majority live in developing countries where poverty, conflict, and climate change create barriers to food security."
  },
  {
    title: "Health Impacts",
    text: "Poverty and poor health are deeply connected. Those living in poverty have limited access to healthcare, clean water, and sanitation, leading to higher rates of preventable diseases."
  },
  {
    title: "Climate & Poverty",
    text: "The poorest populations contribute the least to climate change but suffer its worst effects. Climate disasters disproportionately impact vulnerable communities, deepening poverty and inequality."
  },
  {
    title: "Child Labor",
    text: "An estimated 160 million children worldwide engage in child labor. Poverty is the primary driver, as families struggle to meet basic needs and turn to child labor as a survival strategy."
  },
  {
    title: "Maternal Health",
    text: "Nearly 290,000 women die from pregnancy and childbirth complications annually. Over 99% of these deaths occur in low-income countries where poverty limits access to quality healthcare."
  },
  {
    title: "Access to Water",
    text: "2.2 billion people lack safe drinking water. Poverty often correlates with limited access to clean water, leading to preventable diseases and reduced quality of life."
  },
  {
    title: "Economic Opportunity",
    text: "Those born into poverty face significant barriers to economic mobility. Limited access to quality education, networks, and capital make it difficult to escape the cycle of poverty."
  },
  {
    title: "Rural Poverty",
    text: "About 80% of the world's poorest people live in rural areas, where economic opportunities are limited and access to basic services like healthcare and education is scarce."
  },
  {
    title: "Migration & Poverty",
    text: "Millions migrate seeking better opportunities to escape poverty. While migration can improve lives, migrants often face exploitation, discrimination, and unsafe working conditions."
  },
  {
    title: "Small Businesses",
    text: "Microenterprises employ over 500 million people worldwide, many of whom are living in or near poverty. Access to credit and training can help break poverty cycles."
  },
  {
    title: "Social Protection",
    text: "Social safety nets and targeted assistance programs can reduce poverty by up to 40%. Investing in social protection is one of the most cost-effective ways to combat poverty."
  },
  {
    title: "Youth Unemployment",
    text: "Young people are nearly 3 times more likely to be unemployed than adults. Youth unemployment in low-income countries contributes to poverty, crime, and social instability."
  },
  {
    title: "Inequality",
    text: "The richest 1% now own more wealth than the middle 60% of the world combined. Rising inequality makes it harder for those in poverty to improve their circumstances."
  },
  {
    title: "Slum Living",
    text: "Over 1 billion people live in slums worldwide, often in overcrowded conditions with limited access to basic services. Slum communities face high rates of poverty and disease."
  },
  {
    title: "Access to Internet",
    text: "4.5 billion people lack reliable internet access, limiting opportunities for education and employment. Digital divide deepens economic inequality and poverty."
  },
  {
    title: "Development Goals",
    text: "The UN Sustainable Development Goals aim to end poverty in all its forms by 2030. Achieving these goals requires global cooperation and investment in sustainable development."
  }
];

async function seedFacts() {
  try {
    console.log('Starting to seed daily facts...');
    let successCount = 0;
    let errorCount = 0;

    for (const fact of facts) {
      try {
        const response = await fetch('http://localhost:4000/api/daily-facts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(fact)
        });

        if (response.ok) {
          const data = await response.json();
          console.log(`✓ Added: "${fact.title}"`);
          successCount++;
        } else {
          console.error(`✗ Failed to add "${fact.title}": ${response.statusText}`);
          errorCount++;
        }
      } catch (err) {
        console.error(`✗ Error adding "${fact.title}":`, err.message);
        errorCount++;
      }
    }

    console.log(`\nSeeding complete!`);
    console.log(`Success: ${successCount}/${facts.length}`);
    if (errorCount > 0) {
      console.log(`Errors: ${errorCount}`);
    }
  } catch (err) {
    console.error('Fatal error during seeding:', err);
    process.exit(1);
  }
}

seedFacts();
