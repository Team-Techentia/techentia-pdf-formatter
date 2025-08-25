import { ZodError } from "zod";

export const errorServerUtils = {
    handleZodError(error: ZodError) {
        return error.issues.map((err: any) => ({
            field: err.path.join('.'),
            message: err.message,
        }));
    }

}