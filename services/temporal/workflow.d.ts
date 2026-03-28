export declare const statusQuery: import("@temporalio/workflow").QueryDefinition<string, [], string>;
export declare const progressQuery: import("@temporalio/workflow").QueryDefinition<number, [], string>;
export declare const updateConfigSignal: import("@temporalio/workflow").SignalDefinition<[any], string>;
export declare function videoTranslationWorkflow(input: {
    bucket: string;
    key: string;
}): Promise<string>;
