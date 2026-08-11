import { z } from "zod";

export const BookRecordSchema = z.object({
    title: z.string(),
    product_url: z.string().url(),
    price_text: z.string(),
    price_gbp: z.number(),
    availability_text: z.string(),
    rating_text: z.string(),
    description: z.string().nullable().optional(),
    source_page: z.string().url(),
    fetched_at: z.iso.datetime()
});

export const validateBookRecord = (record) =>
    BookRecordSchema.safeParse(record);
