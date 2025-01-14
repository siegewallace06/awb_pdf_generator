// Import necessary modules or define models as needed
// For example: const { AwbPrintingStyle, PrinterOrientation } = require('./models');

class AwbUtil {
    static A4_AWB_PRINTING_STYLE = {
        subtitleFontSize: 14,
        descriptionFontSize: 9,
        trackingNumberFontSize: 14,
        boxTitleFontSize: 13,
        boxContentHeight: 145,
        rowContentHeight: 30,
        boxContentTableFontSize: 12,
        boxContentTableWidthPercentage: 100,
        marginHeight: 10,
        marginFontSize: 1,
        footerMarginHeight: 10,
        footerMarginFontSize: 1,
        parcelSizeTitleFontSize: 14,
        parcelSizeImageHeight: 40,
        parcelSizeDescriptionFontSize: 10,
        boxSmallTitleFontSize: 10,
        boxCommentHeight: 50,
        boxCodFontSize: 17,
        boxCodHeight: 40,
        infoIconHeight: 17,
        addressFontSize: 12,
        timeslotFontSize: 12,
        codFontSize: 12,
        commentsFontSize: 12,
        sortCodeFontSize: 24,
        sortCodeGuideFontSize: 10,
        boxQRHeight: 32,
        boxBarcodeHeight: 24,
    };

    static A4_LANDSCAPE_AWB_PRINTING_STYLE = {
        subtitleFontSize: 20,
        descriptionFontSize: 13,
        trackingNumberFontSize: 20,
        boxTitleFontSize: 18,
        boxContentHeight: 203,
        rowContentHeight: 42,
        boxContentTableFontSize: 17,
        boxContentTableWidthPercentage: 100,
        marginHeight: 14,
        marginFontSize: 1,
        footerMarginHeight: 14,
        footerMarginFontSize: 1,
        parcelSizeTitleFontSize: 20,
        parcelSizeImageHeight: 56,
        parcelSizeDescriptionFontSize: 14,
        boxSmallTitleFontSize: 14,
        boxCommentHeight: 70,
        boxCodFontSize: 24,
        boxCodHeight: 56,
        infoIconHeight: 24,
        addressFontSize: 17,
        timeslotFontSize: 17,
        codFontSize: 17,
        commentsFontSize: 17,
        sortCodeFontSize: 34,
        sortCodeGuideFontSize: 14,
        boxQRHeight: 45,
        boxBarcodeHeight: 45,
    };

    static A5_AWB_PRINTING_STYLE = {
        subtitleFontSize: 14,
        descriptionFontSize: 9,
        trackingNumberFontSize: 14,
        boxTitleFontSize: 13,
        boxContentHeight: 145,
        rowContentHeight: 30,
        boxContentTableFontSize: 12,
        boxContentTableWidthPercentage: 100,
        marginHeight: 10,
        marginFontSize: 1,
        footerMarginHeight: 80,
        footerMarginFontSize: 1,
        parcelSizeTitleFontSize: 14,
        parcelSizeImageHeight: 40,
        parcelSizeDescriptionFontSize: 10,
        boxSmallTitleFontSize: 10,
        boxCommentHeight: 50,
        boxCodFontSize: 17,
        boxCodHeight: 40,
        infoIconHeight: 20,
        addressFontSize: 12,
        timeslotFontSize: 12,
        codFontSize: 12,
        commentsFontSize: 12,
        sortCodeFontSize: 24,
        sortCodeGuideFontSize: 10,
        boxQRHeight: 32,
        boxBarcodeHeight: 24,
    };

    static DEFAULT_AWB_PRINTING_STYLE = {
        subtitleFontSize: 8,
        descriptionFontSize: 6,
        trackingNumberFontSize: 9,
        boxTitleFontSize: 8,
        boxContentHeight: 90,
        rowContentHeight: 22,
        boxContentTableFontSize: 8,
        boxContentTableWidthPercentage: 100,
        marginHeight: 5,
        marginFontSize: 1,
        footerMarginHeight: 20,
        footerMarginFontSize: 1,
        parcelSizeTitleFontSize: 8,
        parcelSizeImageHeight: 27,
        parcelSizeDescriptionFontSize: 8,
        boxSmallTitleFontSize: 8,
        boxCommentHeight: 40,
        boxCodFontSize: 10,
        boxCodHeight: 24,
        infoIconHeight: 12,
        addressFontSize: 16,
        timeslotFontSize: 16,
        codFontSize: 16,
        commentsFontSize: 16,
        sortCodeFontSize: 20,
        sortCodeGuideFontSize: 8,
    };

    static generateAwbPrintingStyleByPaperSize(paperSize, printerOrientation) {
        let style;

        if (!paperSize) {
            style = AwbUtil.DEFAULT_AWB_PRINTING_STYLE;
        } else {
            switch (paperSize) {
                case "A4":
                    style = (printerOrientation === "LANDSCAPE")
                        ? AwbUtil.A4_LANDSCAPE_AWB_PRINTING_STYLE
                        : AwbUtil.A4_AWB_PRINTING_STYLE;
                    break;
                case "A5":
                    style = AwbUtil.A5_AWB_PRINTING_STYLE;
                    break;
                default:
                    style = AwbUtil.DEFAULT_AWB_PRINTING_STYLE;
            }
        }

        return AwbUtil.generateAwbPrintingStyle(style);
    }

    static generateAwbPrintingStyle(style) {
        return `
            .awb_table .subtitle { font-size: ${style.subtitleFontSize}px; }
            .awb_table .description { font-style: italic; color: #828385; font-size: ${style.descriptionFontSize}px; }
            .awb_table .tracking_num { font-size: ${style.trackingNumberFontSize}px; }
            .awb_table .sort_code_box { border: 1px solid #000; width: 100%; }
            .awb_table .sort_code { font-weight: bold; font-size: ${style.sortCodeFontSize}px; }
            .awb_table .sort_code_guide { font-weight: bold; font-size: ${style.sortCodeGuideFontSize}px; color: #9d9d9d; letter-spacing: 4px; }
            .awb_table .sort_code_margin { height: 10px; font-size: 1px; }
            .awb_table .text_center { text-align: center; }
            .awb_table .box { border: 1.5px solid #cccccc; width: 100%; }
            .awb_table .box .box_title { border-bottom: 1.5px solid #cccccc; font-weight: bold; font-size: ${style.boxTitleFontSize}px; }
            .awb_table .box_content { height: ${style.boxContentHeight}px; }
            .awb_table .row_content { height: ${style.rowContentHeight}px; }
            .awb_table .box_content_table { font-size: ${style.boxContentTableFontSize}px; width: ${style.boxContentTableWidthPercentage}%; }
            .awb_table .grey_text { color: #828385; }
            .awb_table .margin { height: ${style.marginHeight}px; font-size: ${style.marginFontSize}px; }
            .footer_margin { height: ${style.footerMarginHeight}px; font-size: ${style.footerMarginFontSize}px; }
            .awb_table .parcel_size_title { font-weight: bold; font-size: ${style.parcelSizeTitleFontSize}px; text-align: center; }
            .awb_table .parcel_size_image { height: ${style.parcelSizeImageHeight}px; }
            .awb_table .parcel_size_description { color: #828385; font-size: ${style.parcelSizeDescriptionFontSize}px; text-align: center; }
            .awb_table .box .small_title { font-weight: bold; font-size: ${style.boxSmallTitleFontSize}px; }
            .awb_table .box .comment { height: ${style.boxCommentHeight}px; }
            .awb_table .box .cod { font-weight: bold; font-size: ${style.boxCodFontSize}px; height: ${style.boxCodHeight}px; text-align: center; }
            .awb_table .info_icon { height: ${style.infoIconHeight}px; }
            .awb_table img.qr_code { height: ${style.boxQRHeight}px; }
            .awb_table img.barcode_code { height: ${style.boxBarcodeHeight}px; }
        `;
    }
}

// Export the class if needed
// module.exports = AwbUtil;
