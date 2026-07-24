import cors from "cors";
import "dotenv/config";
import express from "express";
import { errorHandler } from "./middleware/errorHandler";
import { adminQuestionnairesRouter } from "./routes/admin/questionnaires";
import { adminSubmissionsRouter } from "./routes/admin/submissions";
import { healthRouter } from "./routes/health";
import { publicQuestionnairesRouter } from "./routes/public/questionnaires";
import { publicSubmissionsRouter } from "./routes/public/submissions";

const corsOrigin = process.env.CORS_ORIGIN?.split(",") ?? "*";

const app = express();

app.use(cors({ origin: corsOrigin }));
app.use(express.json());

app.use("/health", healthRouter);

app.use("/api/public/questionnaires", publicQuestionnairesRouter);
app.use("/api/public/submissions", publicSubmissionsRouter);

app.use("/api/admin/questionnaires", adminQuestionnairesRouter);
app.use("/api/admin/submissions", adminSubmissionsRouter);

app.use(errorHandler);

export default app;
