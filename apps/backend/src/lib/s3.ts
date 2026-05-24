import { S3Client } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

export const uploadS3File = async (image: File) => {
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = `${randomUUID()}-${image.name}`;

    await s3.send(
        new PutObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET!,
            Key: fileName,
            Body: buffer,
            ContentType: image.type,
        })
    );

    const imageUrl =
        `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;

    return imageUrl;
}

export const deleteS3File = async (imageUrl: string) => {
    const key = imageUrl.split("/").pop();

    if (!key) return false;

    await s3.send(
        new DeleteObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET!,
            Key: key,
        })
    );

    return true;
};