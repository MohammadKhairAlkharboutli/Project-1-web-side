import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { sharedEmptyStateShell } from "@/components/shared/styles";

function formatFileSize(size) {
  const bytes = Number(size);

  if (!Number.isFinite(bytes) || bytes < 0) {
    return "Not available";
  }

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(value) {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
  }).format(date);
}

function getUploaderLabel(attachment) {
  const name = attachment?.uploadedBy?.fullName || attachment?.uploadedBy?.name;
  const role = attachment?.uploadedBy?.role;

  if (!name) {
    return "Not available";
  }

  return role ? `${name} (${role})` : name;
}

export default function MedicalAttachmentsTable({
  attachments = [],
  emptyMessage = "No medical attachments.",
  onDownload,
}) {
  if (!attachments.length) {
    return (
      <div className={`${sharedEmptyStateShell} p-5`}>
        <p className="text-sm font-medium text-slate-700">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>File name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Uploaded</TableHead>
            <TableHead>Added by</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {attachments.map((attachment) => (
            <TableRow key={attachment.id}>
              <TableCell className="max-w-52 truncate font-medium text-slate-900">
                {attachment.originalName || "Unnamed file"}
              </TableCell>
              <TableCell>{attachment.fileType || "Unknown"}</TableCell>
              <TableCell>{formatFileSize(attachment.fileSize)}</TableCell>
              <TableCell>{formatDate(attachment.createdAt || attachment.created_at)}</TableCell>
              <TableCell className="max-w-48 truncate">
                {getUploaderLabel(attachment)}
              </TableCell>
              <TableCell className="max-w-64 truncate">
                {attachment.description || "No description"}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!onDownload}
                  title={onDownload ? "Download attachment" : "Download will be enabled when the attachment API is connected."}
                  onClick={() => onDownload?.(attachment)}
                >
                  <Download className="h-3.5 w-3.5" />
                  Download
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
