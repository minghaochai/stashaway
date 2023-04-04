import { Router } from "express";
import { put } from "../controllers/Deposit";

const router = Router();

router.put("/deposit", put);

export default router;
