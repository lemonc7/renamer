use axum::{
    Json,
    extract::{FromRequest, FromRequestParts, Query},
};
use serde::de::DeserializeOwned;
use validator::Validate;

use crate::error::AppError;

pub struct ValidatedJson<T>(pub T);
pub struct ValidatedQuery<T>(pub T);
// pub struct ValidatedPath<T>(pub T);

impl<S, T> FromRequest<S> for ValidatedJson<T>
where
    T: DeserializeOwned + Validate,
    S: Send + Sync,
{
    type Rejection = AppError;

    async fn from_request(req: axum::extract::Request, state: &S) -> Result<Self, Self::Rejection> {
        let Json(value) = Json::<T>::from_request(req, state)
            .await
            .map_err(|rejection| AppError::BadRequest(rejection.body_text()))?;

        value.validate().map_err(AppError::ValidationError)?;
        Ok(ValidatedJson(value))
    }
}

impl<S, T> FromRequestParts<S> for ValidatedQuery<T>
where
    T: DeserializeOwned + Validate,
    S: Send + Sync,
{
    type Rejection = AppError;

    async fn from_request_parts(
        parts: &mut axum::http::request::Parts,
        state: &S,
    ) -> Result<Self, Self::Rejection> {
        let Query(value) = Query::<T>::from_request_parts(parts, state)
            .await
            .map_err(|rejection| AppError::BadRequest(rejection.body_text()))?;
        value.validate().map_err(AppError::ValidationError)?;

        Ok(ValidatedQuery(value))
    }
}

// impl<S, T> FromRequestParts<S> for ValidatedPath<T>
// where
//     T: DeserializeOwned + Validate + Send,
//     S: Send + Sync,
// {
//     type Rejection = AppError;
//     async fn from_request_parts(
//         parts: &mut axum::http::request::Parts,
//         state: &S,
//     ) -> Result<Self, Self::Rejection> {
//         let Path(value) = Path::<T>::from_request_parts(parts, state)
//             .await
//             .map_err(|rejection| AppError::BadRequest(rejection.body_text()))?;

//         value.validate().map_err(AppError::ValidationError)?;

//         Ok(ValidatedPath(value))
//     }
// }
