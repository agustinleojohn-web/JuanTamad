import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';

// Pages - Core
import { HomePage } from './pages/HomePage';
import { ImageToolsPage } from './pages/ImageToolsPage';
import { ImageCompressPage } from './pages/ImageCompressPage';
import { ImageConvertPage } from './pages/ImageConvertPage';
import { ImageResizePage } from './pages/ImageResizePage';

// Pages - Image Studio & AI Suite

import { ImageCropPage } from './pages/image/ImageCropPage';
import { ImageUpscalePage } from './pages/image/ImageUpscalePage';
import { ImageRemoveBgPage } from './pages/image/ImageRemoveBgPage';
import { ImageObjectRemoverPage } from './pages/image/ImageObjectRemoverPage';
import { ImageBlurFacePage } from './pages/image/ImageBlurFacePage';
import { PhotoEditorPage } from './pages/image/PhotoEditorPage';
import { ImageAdjustPage } from './pages/image/ImageAdjustPage';
import { ImageRotatePage } from './pages/image/ImageRotatePage';
import { ImageTiltPage } from './pages/image/ImageTiltPage';
import { ImageMetadataPage } from './pages/image/ImageMetadataPage';
import { ImageCollagePage } from './pages/image/ImageCollagePage';
import { ImageMemePage } from './pages/image/ImageMemePage';
import { ImageWatermarkPage } from './pages/image/ImageWatermarkPage';
import { ImageGifMakerPage } from './pages/image/ImageGifMakerPage';
import { ImageFaviconPage } from './pages/image/ImageFaviconPage';
import { ImageAndroidIconPage } from './pages/image/ImageAndroidIconPage';
import { ImageColorReaderPage } from './pages/image/ImageColorReaderPage';
import { ImageIosAssetPage } from './pages/image/ImageIosAssetPage';
import { ImageAndroidDrawablePage } from './pages/image/ImageAndroidDrawablePage';

// Pages - Documents
import { DocumentToolsPage } from './pages/DocumentToolsPage';
import { ImageToPdfPage } from './pages/ImageToPdfPage';
import { DocxToPdfPage } from './pages/DocxToPdfPage';
import { TextToPdfPage } from './pages/TextToPdfPage';
import { HtmlToPdfPage } from './pages/HtmlToPdfPage';
import { CsvToPdfPage } from './pages/CsvToPdfPage';
import { XlsxToPdfPage } from './pages/XlsxToPdfPage';
import { PdfToImagesPage } from './pages/PdfToImagesPage';

// Pages - PDF Suite
import { PdfToolsPage } from './pages/PdfToolsPage';
import { PdfMergePage } from './pages/PdfMergePage';
import { PdfSplitPage } from './pages/PdfSplitPage';
import { PdfExtractPage } from './pages/PdfExtractPage';
import { PdfRotatePage } from './pages/PdfRotatePage';
import { PdfCompressPage } from './pages/pdf/PdfCompressPage';
import { PdfOptimizePage } from './pages/pdf/PdfOptimizePage';
import { PdfOrganizeStudioPage } from './pages/pdf/PdfOrganizeStudioPage';
import { PdfUnlockPage } from './pages/pdf/PdfUnlockPage';
import { PdfCropPage } from './pages/pdf/PdfCropPage';
import { PdfPageNumbersPage } from './pages/pdf/PdfPageNumbersPage';
import { PdfNUpPage } from './pages/pdf/PdfNUpPage';
import { PdfSignPage } from './pages/pdf/PdfSignPage';
import { PdfRedactPage } from './pages/pdf/PdfRedactPage';
import { PdfWatermarkPage } from './pages/pdf/PdfWatermarkPage';
import { PdfHeaderFooterPage } from './pages/pdf/PdfHeaderFooterPage';
import { PdfFlattenPage } from './pages/pdf/PdfFlattenPage';
import { PdfFormFillerPage } from './pages/pdf/PdfFormFillerPage';
import { PdfPropertiesPage } from './pages/pdf/PdfPropertiesPage';
import { PdfOcrPage } from './pages/pdf/PdfOcrPage';
import { PdfComparePage } from './pages/pdf/PdfComparePage';
import { PdfToWordPage } from './pages/pdf/PdfToWordPage';
import { PdfExtractTextPage } from './pages/pdf/PdfExtractTextPage';
import { PdfColorFiltersPage } from './pages/pdf/PdfColorFiltersPage';
import { PdfRepairPage } from './pages/pdf/PdfRepairPage';

// Legal & About
import { AboutPage } from './pages/AboutPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { TermsPage } from './pages/TermsPage';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <ScrollToTop />
        <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
          <Header />
          <main className="flex-1">
            <Routes>
              {/* Homepage */}
              <Route path="/" element={<HomePage />} />

              {/* Image Tools - Optimize */}
              <Route path="/image-tools" element={<ImageToolsPage />} />
            
              <Route path="/image-tools/compress" element={<ImageCompressPage />} />
              <Route path="/image-tools/convert" element={<ImageConvertPage />} />
              <Route path="/image-tools/resize" element={<ImageResizePage />} />
              <Route path="/image-tools/crop" element={<ImageCropPage />} />

              {/* Image Tools - AI */}
              <Route path="/image-tools/upscale" element={<ImageUpscalePage />} />
              <Route path="/image-tools/remove-bg" element={<ImageRemoveBgPage />} />
              <Route path="/image-tools/object-remover" element={<ImageObjectRemoverPage />} />
              <Route path="/image-tools/blur-face" element={<ImageBlurFacePage />} />

              {/* Image Tools - Edit */}
              <Route path="/image-tools/photo-editor" element={<PhotoEditorPage />} />
              <Route path="/image-tools/adjust" element={<ImageAdjustPage />} />
              <Route path="/image-tools/rotate" element={<ImageRotatePage />} />
              <Route path="/image-tools/tilt" element={<ImageTiltPage />} />
              <Route path="/image-tools/metadata" element={<ImageMetadataPage />} />

              {/* Image Tools - Create */}
              <Route path="/image-tools/collage" element={<ImageCollagePage />} />
              <Route path="/image-tools/meme" element={<ImageMemePage />} />
              <Route path="/image-tools/watermark" element={<ImageWatermarkPage />} />

              {/* Image Tools - Convert & GIF */}
              <Route path="/image-tools/gif-maker" element={<ImageGifMakerPage />} />

              {/* Image Tools - Icons */}
              <Route path="/image-tools/favicon" element={<ImageFaviconPage />} />
              <Route path="/image-tools/android-icons" element={<ImageAndroidIconPage />} />

              {/* Image Tools - Color */}
              <Route path="/image-tools/color-reader" element={<ImageColorReaderPage />} />

              {/* Image Tools - Dev */}
              <Route path="/image-tools/ios-assets" element={<ImageIosAssetPage />} />
              <Route path="/image-tools/android-drawables" element={<ImageAndroidDrawablePage />} />

              {/* Document Tools */}
              <Route path="/document-tools" element={<DocumentToolsPage />} />
              <Route path="/document-tools/image-to-pdf" element={<ImageToPdfPage />} />
              <Route path="/document-tools/docx-to-pdf" element={<DocxToPdfPage />} />
              <Route path="/document-tools/txt-to-pdf" element={<TextToPdfPage />} />
              <Route path="/document-tools/html-to-pdf" element={<HtmlToPdfPage />} />
              <Route path="/document-tools/csv-to-pdf" element={<CsvToPdfPage />} />
              <Route path="/document-tools/xlsx-to-pdf" element={<XlsxToPdfPage />} />
              <Route path="/document-tools/pdf-to-images" element={<PdfToImagesPage />} />

              {/* PDF Toolkit Suite */}
              <Route path="/pdf-tools" element={<PdfToolsPage />} />
              <Route path="/pdf-tools/merge" element={<PdfMergePage />} />
              <Route path="/pdf-tools/split" element={<PdfSplitPage />} />
              <Route path="/pdf-tools/extract-pages" element={<PdfExtractPage />} />
              <Route path="/pdf-tools/rotate-pages" element={<PdfRotatePage />} />
              <Route path="/pdf-tools/compress" element={<PdfCompressPage />} />
              <Route path="/pdf-tools/optimize" element={<PdfOptimizePage />} />
              <Route path="/pdf-tools/organize" element={<PdfOrganizeStudioPage />} />
              <Route path="/pdf-tools/unlock" element={<PdfUnlockPage />} />
              <Route path="/pdf-tools/crop" element={<PdfCropPage />} />
              <Route path="/pdf-tools/page-numbers" element={<PdfPageNumbersPage />} />
              <Route path="/pdf-tools/n-up" element={<PdfNUpPage />} />
              <Route path="/pdf-tools/sign" element={<PdfSignPage />} />
              <Route path="/pdf-tools/redact" element={<PdfRedactPage />} />
              <Route path="/pdf-tools/watermark" element={<PdfWatermarkPage />} />
              <Route path="/pdf-tools/header-footer" element={<PdfHeaderFooterPage />} />
              <Route path="/pdf-tools/flatten" element={<PdfFlattenPage />} />
              <Route path="/pdf-tools/form-filler" element={<PdfFormFillerPage />} />
              <Route path="/pdf-tools/properties" element={<PdfPropertiesPage />} />
              <Route path="/pdf-tools/ocr" element={<PdfOcrPage />} />
              <Route path="/pdf-tools/compare" element={<PdfComparePage />} />
              <Route path="/pdf-tools/pdf-to-word" element={<PdfToWordPage />} />
              <Route path="/pdf-tools/extract-text" element={<PdfExtractTextPage />} />
              <Route path="/pdf-tools/color-filters" element={<PdfColorFiltersPage />} />
              <Route path="/pdf-tools/repair" element={<PdfRepairPage />} />

              {/* General & Legal */}
              <Route path="/about" element={<AboutPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />

              {/* Fallback */}
              <Route path="*" element={<HomePage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}
