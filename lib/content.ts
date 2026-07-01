import unitsRaw from "@/data/units.json";
import testsRaw from "@/data/tests.json";
import type { UnitData, TestsData } from "./types";

const units = unitsRaw as unknown as Record<string, UnitData>;
const tests = testsRaw as unknown as TestsData;

export function getAllUnits(): UnitData[] {
  return Object.values(units).sort((a, b) => a.number - b.number);
}

export function getUnit(num: number | string): UnitData | undefined {
  return units[String(num)];
}

export function getTests(): TestsData {
  return tests;
}

export const UNIT_NUMBERS = Object.keys(units)
  .map(Number)
  .sort((a, b) => a - b);
