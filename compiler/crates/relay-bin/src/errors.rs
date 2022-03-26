use thiserror::Error;

#[derive(Debug, Error)]
pub enum Error {
    #[error("Unable to run the relay language server. Error details: \n{details}")]
    LSPError { details: String },

    #[error("Unable to initialize relay compiler configuration. Error details: \n{details}")]
    ConfigError { details: String },

    #[error("Unable to run relay compiler. Error details: \n{details}")]
    CompilerError { details: String },
}
