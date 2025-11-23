import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ImageState {
  originalUri: string | null;
  compressedUri: string | null;
  pdfUri: string | null;
}

const initialState: ImageState = {
  originalUri: null,
  compressedUri: null,
  pdfUri: null,
};

const imageSlice = createSlice({
  name: "image",
  initialState,
  reducers: {
    setOriginalImage: (state, action: PayloadAction<string>) => {
      state.originalUri = action.payload;
    },
    setCompressedImage: (state, action: PayloadAction<string>) => {
      state.compressedUri = action.payload;
    },
    setPdfUri: (state, action: PayloadAction<string>) => {
      state.pdfUri = action.payload;
    },
    clearImage: (state) => {
      state.originalUri = null;
      state.compressedUri = null;
      state.pdfUri = null;
    },
  },
});

export const { setOriginalImage, setCompressedImage, setPdfUri, clearImage } =
  imageSlice.actions;

export default imageSlice.reducer;
