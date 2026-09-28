// จุดเดียวที่สร้างโมเดลของ Firebase AI Logic (technology-stack.md decision area 20/22/23)
import {getAI, getGenerativeModel, GoogleAIBackend, type GenerativeModel} from "firebase/ai";

import {app} from "../firebase";
import {GEMINI_MODEL_NAME} from "./config";

export function createModel(systemInstruction: string): GenerativeModel {
  return getGenerativeModel(getAI(app, {backend: new GoogleAIBackend()}), {
    model: GEMINI_MODEL_NAME,
    systemInstruction,
  });
}
