import { validateBookRecord } from "./schema.js";
import { writeFile, mkdir } from "node:fs/promises";

export const storeRecords = async (records, dir = "output") => {
    const valid = [];
    const errors = [];

    for (const record of records) {
        const result = validateBookRecord(record);
        if (result.success) {
            valid.push(result.data);
        } else {
            errors.push({
                record,
                reasons: result.error.issues.map(
                    issue => `${issue.path.join('.')}: ${issue.message}`
                )
            });
        }
    }

    await mkdir(dir, { recursive: true });
    await writeFile(`${dir}/books.json`, JSON.stringify(valid, null, 2));
    await writeFile(`${dir}/errors.json`, JSON.stringify(errors, null, 2));

    return { validCount: valid.length, errorCount: errors.length };
};
