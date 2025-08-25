import { formServerUtils } from "@/lib/utils";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        switch (req.method) {
            case "POST": {
                const result = await formServerUtils.createForm(req.body);
                res.status(result.success ? 201 : 404).json(result)
            }
            case "GET": {
                const { id } = req.query;
                if (id) {
                    // Get single form
                    const form = await formServerUtils.getForm(id as string);
                    if (!form) {
                        return res.status(404).json({ error: "Form not found" });
                    }
                    return res.status(200).json(form);
                } else {
                    const { limit = '10', offset = '0' } = req.query;
                    const forms = await formServerUtils.getForms({
                        limit: parseInt(limit as string),
                        offset: parseInt(offset as string)
                    });
                    return res.status(200).json(forms);
                }
            }
            case "PUT": {
                const { id } = req.query;
                if (!id) {
                    return res.status(400).json({ error: "Form ID is required" });
                }
                const result = await formServerUtils.updateForm(id as string, req.body);
                if (!result) {
                    return res.status(404).json({ error: "Form not found" });
                }
                return res.status(200).json(result);
            }
            case "DELETE": {
                const { id } = req.query;
                if (!id) {
                    return res.status(400).json({ error: "Form ID is required" });
                }
                const success = await formServerUtils.deleteForm(id as string);
                if (!success) {
                    return res.status(404).json({ error: "Form not found" });
                }
                return res.status(200).json({ message: "Form deleted successfully" });
            }
            default: {
                res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
                return res.status(405).json({ error: `Method ${req.method} not allowed` });
            }
        }
    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}