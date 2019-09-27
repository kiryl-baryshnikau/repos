import { IvPrepModels } from '../../shared/mvd-models';

export declare module ContinuousInfusionsModels {
    interface OrderServiceResponse {
        infusionContainer: any;
        error: boolean;
        orderServices?: any[];
    }

    interface OrderSelectedResponse {
        infusionData: any;
        order: any;
        ivPrepConfig: IvPrepModels.ApiConfig;
        doses: IvPrepModels.Dose[];
        isMultipleOrdersWorkflow: boolean;
    }
}
