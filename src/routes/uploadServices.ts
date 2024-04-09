/* eslint-disable @typescript-eslint/no-explicit-any */
// routes/apiResponseRoutes.ts
import express, { Request, Response } from "express";

import { S3Client } from "@aws-sdk/client-s3";
import multer from "multer";
import multers3 from "multer-s3";

const { AWS_ACCESS_KEY, AWS_SECEET_KEY, AWS_URL } = process.env;
export type ifileName =
  | "dob"
  | "aadhar"
  | "pan"
  | "passport"
  | "voterId"
  | "drivingLicense"
  | "rationCard"
  | "electricityBill"
  | "waterBill"
  | "telephoneBill"
  | "gasBill"
  | "propertyTax"
  | "bankStatement"
  | "salarySlip"
  | "rentalAgreement"
  | "passportSizePhoto"
  | "signature"
  | "matriculationCertificate"
  | "intermediateCertificate"
  | "degreeCertificate"
  | "postGraduationCertificate"
  | "doctoralCertificate"
  | "otherCertificate"
  | "otherDocument"
  | null;

	// eslint-disable-next-line
	//@ts-ignore
const s3Config = new S3Client({
  region: "blr1",
  endpoint: AWS_URL,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY,
    secretAccessKey: AWS_SECEET_KEY,
  },
});

import { UploadFileService } from "..";
import path from "path";

const upload = multer({
  storage: multers3({
    s3: s3Config,
    bucket: "hpca",
    acl: "public-read",
    key: function (req: Request & { query: any }, file, cb) {
      // eslint-disable-next-line no-console
      interface FileName {
        phone: string;
        fileName: ifileName;
      }

      const { phone = "", fileName = "otherDocument" }: FileName = req.query;
      if (!phone || fileName === "otherDocument") {
        return cb(new Error("Phone number is required in Query Params"));
      }

      const allowedExtensions = [".jpg", ".jpeg", ".png", ".pdf"]; // Add more if needed
      const fileExtension = path.extname(file.originalname).toLowerCase();
      if (!allowedExtensions.includes(fileExtension)) {
        return cb(
          new Error(
            "Invalid file extension. Allowed extensions: jpg, jpeg, png, pdf"
          )
        );
      }

      const maxFileSize = 10 * 1024 * 1024;
      if (file.size > maxFileSize) {
        return cb(new Error("File size exceeds the maximum limit of 10 MB"));
      }

      const timestamp = Date.now();
      const savedFileName = `documents/${phone}/${timestamp}_${file.originalname.toLowerCase()}`;
      cb(null, savedFileName);
    },
  }),
}).array("upload", 1);
const router = express.Router();

// Create - Add a new API response
router.post(
  "/addFile",

  async (req: Request, res: Response) => {
    try {
      upload(req, res, async function (error) {
        if (error) {
          // eslint-disable-next-line no-console
          console.log(error);
          return res.status(500).json({ error: error.message });
        }

        // eslint-disable-next-line
        //@ts-ignore-next-line
        if (Array.isArray(req.files) && req.files[0]?.location) {
          const fileUrl = Array.isArray(req.files)
            ? // eslint-disable-next-line
              //@ts-ignore-next-line
              req.files[0]?.location
            : undefined;
          await UploadFileService.create({
            fileName: req.query.fileName as string,
            fileUrl: fileUrl as string,
            uploadedBy: req.query.phone as string,
          });
          res.json(req.files);
        }
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error processing file upload:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

router.get("/getFileFromUploadedBy", async (req: Request, res: Response) => {
  try {
    const { uploadedBy } = req.query;
    if (uploadedBy) {
      const getFiles = await UploadFileService.findAll({
        where: {
          uploadedBy: uploadedBy.toString(),
        },
      });

      res.status(200).jsonp({
        files: getFiles,
      });
    } else {
      res.status(500).jsonp({
        message: "Please provide the phone number to get the files in body",
      });
    }
  } catch (error) {
    res.send({ error: error, message: "Something went Wrong" });
  }
});

router.get("/getAllFiles", async (req: Request, res: Response) => {
  try {
    const getFiles = await UploadFileService.findAll();

    res.status(200).jsonp({
      files: getFiles,
    });
  } catch (error) {
    res.send({ error: error, message: "Something went Wrong" });
  }
});

router.get("/getFileNames", async (req: Request, res: Response) => {
  res.status(200).jsonp({
    message: "Types of files that can be uploaded",
    files: [
      "dob",
      "aadhar",
      "pan",
      "passport",
      "voterId",
      "drivingLicense",
      "rationCard",
      "electricityBill",
      "waterBill",
      "telephoneBill",
      "gasBill",
      "propertyTax",
      "bankStatement",
      "salarySlip",
      "rentalAgreement",
      "passportSizePhoto",
      "signature",
      "matriculationCertificate",
      "intermediateCertificate",
      "degreeCertificate",
      "postGraduationCertificate",
      "doctoralCertificate",
      "otherCertificate",
      "otherDocument",
    ],
  });
});

export default router;
