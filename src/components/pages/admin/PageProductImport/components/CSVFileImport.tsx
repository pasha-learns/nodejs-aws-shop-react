import React from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";

type CSVFileImportProps = {
  url: string;
  title: string;
};

function extractUrlFromText(value: string): string | undefined {
  const trimmed = value.trim().replace(/^["']|["']$/g, "");
  if (trimmed.startsWith("http")) {
    return trimmed;
  }
  const match = trimmed.match(/https?:\/\/\S+/);
  return match?.[0];
}

function parsePresignedUrl(data: unknown): string {
  if (typeof data === "string") {
    const url = extractUrlFromText(data);
    if (url) {
      return url;
    }
    if (
      data.trim().toLowerCase().startsWith("<!doctype") ||
      data.includes("<html")
    ) {
      throw new Error(
        "Import returned HTML instead of an upload URL. Set VITE_API_URL to your Import API base (no /import suffix), then rebuild (npm run build)."
      );
    }
  }
  if (data && typeof data === "object") {
    const o = data as Record<string, unknown>;
    const candidate =
      o.url ?? o.signedUrl ?? o.uploadUrl ?? o.uploadURL ?? o.body ?? o.data;
    if (typeof candidate === "string") {
      return parsePresignedUrl(candidate);
    }
    if (typeof o.message === "string") {
      throw new Error(o.message);
    }
  }
  throw new Error("Import API did not return a presigned upload URL");
}

async function fetchPresignedUploadUrl(
  importEndpoint: string,
  fileName: string
) {
  const requestUrl = new URL(importEndpoint);
  requestUrl.searchParams.set("name", fileName);
  const response = await fetch(requestUrl.toString());
  const text = await response.text();
  if (!response.ok) {
    let message = `Import request failed (${response.status})`;
    try {
      const json = JSON.parse(text) as { message?: string };
      if (json.message) {
        message = json.message;
      }
    } catch {
      if (text.trim()) {
        message = text.trim();
      }
    }
    throw new Error(message);
  }
  let payload: unknown = text;
  try {
    payload = JSON.parse(text);
  } catch {
    /* plain-text presigned URL */
  }
  return parsePresignedUrl(payload);
}

export default function CSVFileImport({ url, title }: CSVFileImportProps) {
  const [file, setFile] = React.useState<File>();
  const [isUploading, setIsUploading] = React.useState(false);
  const [error, setError] = React.useState<string>();
  const [success, setSuccess] = React.useState<string>();
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setFile(files[0]);
      setError(undefined);
      setSuccess(undefined);
    }
  };

  const removeFile = () => {
    setFile(undefined);
    setError(undefined);
    setSuccess(undefined);
  };

  const uploadFile = async () => {
    if (!file) {
      return;
    }

    setIsUploading(true);
    setError(undefined);
    setSuccess(undefined);

    try {
      if (!url.startsWith("http")) {
        throw new Error(
          "Import URL is not configured. Set VITE_API_URL in .env to your Import API base, then rebuild."
        );
      }
      const uploadUrl = await fetchPresignedUploadUrl(url, file.name);
      const result = await fetch(uploadUrl, {
        method: "PUT",
        body: await file.arrayBuffer(),
      });

      if (!result.ok) {
        throw new Error(`S3 upload failed (${result.status})`);
      }

      setFile(undefined);
      setSuccess(
        `Uploaded ${file.name}. Check CloudWatch logs for the ImportFileParser Lambda to see parsed CSV rows.`
      );
    } catch (err) {
      let message = err instanceof Error ? err.message : "Upload failed";
      if (/failed to fetch|load failed|networkerror/i.test(message)) {
        message =
          "S3 upload blocked by CORS. On the import bucket, allow PUT from your app origin (e.g. http://localhost:4173), or redeploy import-service CDK to apply bucket CORS.";
      }
      setError(message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      {!file ? (
        <input type="file" accept=".csv" onChange={onFileChange} />
      ) : (
        <Box display="flex" flexDirection="column" gap={1}>
          <Typography variant="body2" color="text.secondary">
            Selected: {file.name}
          </Typography>
          <Box display="flex" gap={1} alignItems="center">
            <Button
              size="small"
              variant="outlined"
              onClick={removeFile}
              disabled={isUploading}
            >
              Remove file
            </Button>
            <Button
              size="small"
              variant="contained"
              onClick={uploadFile}
              disabled={isUploading}
              startIcon={
                isUploading ? (
                  <CircularProgress size={16} color="inherit" />
                ) : undefined
              }
            >
              {isUploading ? "Uploading…" : "Upload file"}
            </Button>
          </Box>
        </Box>
      )}
      {error && (
        <Alert severity="error" sx={{ mt: 1 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mt: 1 }}>
          {success}
        </Alert>
      )}
    </Box>
  );
}
