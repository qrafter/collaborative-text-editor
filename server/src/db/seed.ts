import * as Y from "yjs";
import appDataSource from "./datasource";
import User from "src/entities/user.entity";
import Document from "src/entities/document.entity";

const documentTitles = [
  "The Future of Artificial Intelligence",
  "Sustainable Living in Urban Environments",
  "Exploring the Depths of Ocean Biodiversity",
  "The Rise of Cryptocurrency: A Financial Revolution",
  "Mindfulness and Mental Health in the Digital Age",
  "Advancements in Renewable Energy Technologies",
  "The Impact of Social Media on Modern Society",
  "Space Exploration: The Next Frontier",
  "Genetic Engineering: Possibilities and Ethical Concerns",
  "The Evolution of E-commerce",
  "Climate Change: Challenges and Solutions",
  "The Art of Effective Communication",
  "Cybersecurity in the 21st Century",
  "The Psychology of Decision Making",
  "Innovations in Sustainable Agriculture",
  "The Role of Big Data in Business Analytics",
  "Virtual Reality: Reshaping Entertainment and Education",
  "The Science of Happiness and Well-being",
  "Artificial Intelligence in Healthcare",
  "The Future of Work: Remote and Hybrid Models",
  "Understanding Quantum Computing",
  "The Impact of Plastic Pollution on Marine Life",
  "Blockchain Technology: Beyond Cryptocurrency",
  "The Neuroscience of Learning and Memory",
  "Sustainable Fashion: Trends and Innovations",
  "The Ethics of Autonomous Vehicles",
  "Exploring Cultural Diversity in a Globalized World",
  "The Psychology of Consumer Behavior",
  "Renewable Energy: The Path to a Sustainable Future",
  "The Impact of 5G Technology",
  "Artificial Intelligence in Education",
  "The Rise of Plant-Based Diets",
  "Cybersecurity Threats and Defense Strategies",
  "The Future of Transportation: Electric and Autonomous Vehicles",
  "The Psychology of Motivation and Goal Setting",
  "Nanotechnology: Applications and Implications",
  "The Impact of Social Media on Mental Health",
  "Sustainable Urban Planning for Smart Cities",
  "The Role of Artificial Intelligence in Art and Creativity",
  "Understanding the Human Microbiome",
  "The Future of Augmented Reality",
  "Climate Change Adaptation Strategies",
  "The Psychology of Leadership and Team Dynamics",
  "Innovations in Waste Management and Recycling",
  "The Impact of Artificial Intelligence on Employment",
  "Exploring the Potential of Fusion Energy",
  "The Ethics of Gene Editing",
  "The Role of IoT in Smart Homes",
  "Understanding Blockchain Technology",
  "The Psychology of Habit Formation and Change",
];

const emailsWithNames = [
  "john.doe@email.com",
  "emma.smith@email.com",
  "michael.johnson@email.com",
  "sophia.williams@email.com",
  "william.brown@email.com",
  "olivia.jones@email.com",
  "james.garcia@email.com",
  "ava.miller@email.com",
  "benjamin.davis@email.com",
  "mia.rodriguez@email.com",
  "elijah.martinez@email.com",
  "charlotte.hernandez@email.com",
  "lucas.lopez@email.com",
  "amelia.gonzalez@email.com",
  "henry.wilson@email.com",
  "harper.anderson@email.com",
  "alexander.thomas@email.com",
  "evelyn.taylor@email.com",
  "daniel.moore@email.com",
  "abigail.jackson@email.com",
  "matthew.martin@email.com",
  "emily.lee@email.com",
  "david.perez@email.com",
  "elizabeth.thompson@email.com",
  "joseph.white@email.com",
  "sofia.harris@email.com",
  "samuel.sanchez@email.com",
  "avery.clark@email.com",
  "jackson.ramirez@email.com",
  "scarlett.lewis@email.com",
  "christopher.robinson@email.com",
  "chloe.walker@email.com",
  "andrew.young@email.com",
  "zoey.allen@email.com",
  "wyatt.king@email.com",
  "victoria.wright@email.com",
  "gabriel.scott@email.com",
  "penelope.torres@email.com",
  "isaac.nguyen@email.com",
  "audrey.hill@email.com",
  "julian.flores@email.com",
  "claire.green@email.com",
  "lincoln.adams@email.com",
  "hazel.nelson@email.com",
  "hunter.baker@email.com",
  "aurora.hall@email.com",
  "christian.rivera@email.com",
  "bella.campbell@email.com",
  "landon.mitchell@email.com",
  "skylar.carter@email.com",
];

function createEmptyYjsSnapshot(title: string): Uint8Array {
  const ydoc = new Y.Doc();
  const ytext = ydoc.getText("quill");
  ytext.insert(0, title); 
  return Y.encodeStateAsUpdate(ydoc);
}

async function createAndSaveUsers() {
  const documentRepository = appDataSource.getRepository(Document);
  const userRepository = appDataSource.getRepository(User);

  for (let i = 0; i < 50; i++) {

    const user = new User();
    user.email = emailsWithNames[i];
    user.password = 'password';
    await userRepository.save(user);
    
    const document = new Document();
    document.name = documentTitles[i];
    document.content = ""; // Initially empty content
    document.snapshot = Buffer.from(createEmptyYjsSnapshot(documentTitles[i]));
    document.owner = user

    await documentRepository.save(document);

    console.log(`Created user and document: ${user.email} - ${document.name}`);
  }
}
export async function seedDatabase() {
  try {
    await appDataSource.initialize();
    console.log("Database connected");

    await createAndSaveUsers();
    console.log("Database seeded successfully");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await appDataSource.destroy();
    console.log("Database connection closed");
  }
}

seedDatabase().catch(console.error);
