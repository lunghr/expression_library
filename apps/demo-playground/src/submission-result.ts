export interface SuccessfulExecutionResultView {
  readonly status: "success";
  readonly value: unknown;
}

export interface FailedExecutionResultView {
  readonly status: "error";
  readonly message: string;
}

export type ExecutionResultView =
  | SuccessfulExecutionResultView
  | FailedExecutionResultView;

export interface NotSentSubmissionResultView {
  readonly status: "not_sent";
  readonly reason: string;
}

export interface SentSubmissionResultView {
  readonly status: "sent";
  readonly expression: string | null;
  readonly executionResult: ExecutionResultView;
}

export interface TransportErrorSubmissionResultView {
  readonly status: "transport_error";
  readonly message: string;
}

export type SubmissionResultView =
  | NotSentSubmissionResultView
  | SentSubmissionResultView
  | TransportErrorSubmissionResultView;
