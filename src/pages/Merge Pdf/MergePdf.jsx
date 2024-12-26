import React, { useState } from "react";
import { PDFDocument } from "pdf-lib";

const MergePDFs = () => {
  const [pdfFiles, setPdfFiles] = useState([]);
  const [mergedPdfUrl, setMergedPdfUrl] = useState(null);

  // Handle file input
  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    setPdfFiles(files);
  };

  // Merge PDFs
  const mergePDFs = async () => {
    if (pdfFiles.length === 0) {
      alert("Please upload at least two PDF files to merge!");
      return;
    }

    // Create a new PDFDocument
    const mergedPdf = await PDFDocument.create();

    // Loop through each PDF file
    for (const file of pdfFiles) {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);

      // Copy all pages from the current PDF
      const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      pages.forEach((page) => mergedPdf.addPage(page));
    }

    // Serialize the merged PDF to bytes
    const mergedPdfBytes = await mergedPdf.save();

    // Create a blob URL to download/view the merged PDF
    const blob = new Blob([mergedPdfBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    setMergedPdfUrl(url);
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>Merge PDF Files</h1>
      <input
        type="file"
        accept="application/pdf"
        multiple
        onChange={handleFileChange}
      />
      <button
        onClick={mergePDFs}
        style={{
          margin: "10px 0",
          padding: "10px 15px",
          backgroundColor: "#4CAF50",
          color: "white",
          border: "none",
          cursor: "pointer",
        }}
      >
        Merge PDFs
      </button>
      {mergedPdfUrl && (
        <div>
          <h2>Merged PDF</h2>
          <a href={mergedPdfUrl} download="MergedPDF.pdf">
            Download Merged PDF
          </a>
          <iframe
            src={mergedPdfUrl}
            width="100%"
            height="600px"
            title="Merged PDF Preview"
            style={{ border: "1px solid #ddd", marginTop: "10px" }}
          ></iframe>
        </div>
      )}
    </div>
  );
};

export default MergePDFs;
