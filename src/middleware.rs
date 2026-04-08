use axum::{extract::Request, middleware::Next, response::Response};
use tracing::{Instrument, field::Empty, info_span};
use uuid::Uuid;

pub async fn trace_id(mut req: Request, next: Next) -> Response {
    let trace_id = Uuid::new_v4().to_string();

    req.extensions_mut().insert(trace_id.clone());

    let span = info_span!(
      "request",
      method = %req.method(),
      uri = %req.uri(),
      trace_id = %trace_id,
      error = Empty,
    );

    next.run(req).instrument(span).await
}
