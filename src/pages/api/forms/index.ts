import { formServerUtils } from "@/lib/utils";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { id, action, fieldId } = req.query;
        switch (req.method) {
            case "POST": {
                const result = await formServerUtils.createForm(req.body);
                return res.status(result.success ? 201 : 400).json(result);
            }
            case "GET": {
                if (id) {
                    const result = await formServerUtils.getForm(id as string);
                    return res.status(result.success ? 200 : 404).json(result);
                } else {
                    const { limit = '10', offset = '0' } = req.query;
                    const result = await formServerUtils.getForms({ limit: parseInt(limit as string), offset: parseInt(offset as string) });
                    return res.status(result.success ? 200 : 500).json(result);
                }
            }
            case "PUT": {
                if (!id) {
                    return res.status(400).json({ success: false, message: "Form ID is required" });
                }

                if (action === 'addField') {
                    const result = await formServerUtils.addField(id as string, req.body);
                    return res.status(result.success ? 200 : 400).json(result);
                }

                if (action === 'updateField') {
                    if (!fieldId) {
                        return res.status(400).json({ success: false, message: "Field ID is required for updateField action" });
                    }
                    const result = await formServerUtils.updateField(id as string, fieldId as string, req.body);
                    return res.status(result.success ? 200 : 400).json(result);
                }

                const result = await formServerUtils.updateForm(id as string, req.body);
                return res.status(result.success ? 200 : 400).json(result);
            }
            case "DELETE": {
                if (!id) {
                    return res.status(400).json({
                        success: false,
                        message: "Form ID is required"
                    });
                }
                if (action === 'removeField') {
                    if (!fieldId) {
                        return res.status(400).json({
                            success: false,
                            message: "Field ID is required for removeField action"
                        });
                    }
                    const result = await formServerUtils.removeField(
                        id as string,
                        fieldId as string
                    );
                    return res.status(result.success ? 200 : 400).json(result);
                }
                const result = await formServerUtils.deleteForm(id as string);
                return res.status(result.success ? 200 : 400).json(result);
            }
            default: {
                res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
                return res.status(405).json({ success: false, message: `Method ${req.method} not allowed` });
            }
        }
    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error' });
    }
}