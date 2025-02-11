const password: string = "afriddev01";

function getMongoURI(collectionName: string): string {
  return `mongodb+srv://afridayan01:${password}@cluster0.egh9y.mongodb.net/${collectionName}?retryWrites=true&w=majority&appName=Cluster0`;
}

export default getMongoURI;
