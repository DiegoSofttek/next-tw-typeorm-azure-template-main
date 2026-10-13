import {
  StorageSharedKeyCredential,
  BlobSASPermissions,
  generateBlobSASQueryParameters,
  BlobServiceClient,
} from "@azure/storage-blob";

const connectionString =
  process.env.AZURE_STORAGE_CONNECTION_STRING || "UseDevelopmentStorage=true";

export const blobClient =
  BlobServiceClient.fromConnectionString(connectionString);

export async function uploadBlob(
  containerName: string,
  blobName: string,
  data: Buffer,
) {
  const container = blobClient.getContainerClient(containerName);

  await container.createIfNotExists();

  const blockBlob = container.getBlockBlobClient(blobName);
  await blockBlob.upload(data, data.length);
  return blockBlob.url;
}

export async function getBlobSasUrl(
  containerName: string,
  blobName: string,
  expiresOn: Date,
): Promise<string> {
  blobClient.credential;
  // 1. Initialize credentials
  const sharedKeyCredential =
    blobClient.credential as StorageSharedKeyCredential;

  // 2. Define SAS permissions and expiration
  const sasOptions = {
    containerName,
    blobName,
    permissions: BlobSASPermissions.parse("r"), // "r" for read-only
    startsOn: new Date(),
    expiresOn,
  };

  // 3. Generate the SAS token query string
  const sasToken = generateBlobSASQueryParameters(
    sasOptions,
    sharedKeyCredential,
  ).toString();

  // 4. Construct the full SAS URL
  const blobUrl = `${process.env.AZURE_STORAGE_ACCOUNT_NAME}/${containerName}/${blobName}`;
  return `${blobUrl}?${sasToken}`;
}
