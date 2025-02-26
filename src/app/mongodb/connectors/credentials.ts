const password: string = process.env.MONGO_DB_PASSWORD as string;

function getMongoURI(databaseName: string): string {
  return `mongodb+srv://afridayan01:${password}@cluster0.egh9y.mongodb.net/${databaseName}?retryWrites=true&w=majority&appName=Cluster0`;
}

export default getMongoURI;