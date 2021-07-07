import * as React from "react";
import { Validator, IValidationResult, Card } from './Validator';

interface IFormProps {
    action: string;
}

export interface IValues {
    [bundle: string]: any;
}

export interface IErrors {
    [message: string]: string;
}

export interface IFormState {
    values: IValues;
    errors: IErrors;
    submitSuccess?: boolean;
    submitResult?: IValidationResult[];
}

export class ValidationForm extends React.Component<IFormProps, IFormState> {
    constructor(props: IFormProps) {
        super(props);

        const errors: IErrors = {};
        const values: IValues = {};
        this.state = {
            errors,
            values
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    private handleChange = async (
        event: React.ChangeEvent<HTMLTextAreaElement>
    ): Promise<void> => {
        this.setState({
            values: {
                bundle: event.target.value
            }
        });
    };

    private handleSubmit = async (
        event: React.FormEvent<HTMLFormElement>
    ): Promise<void> => {
        event.preventDefault();

        if (this.validateForm()) {
            const submitResult: [IValidationResult] = await this.submitForm();
            this.setState({ submitResult });
            this.setState({ submitSuccess: true });
        }
    };

    private haveErrors(errors: IErrors) {
        let haveError: boolean = false;
        Object.keys(errors).forEach((key: string) => {
            if (errors[key].length > 0) {
                haveError = true;
            }
        });
        return haveError;
    }

    private validateForm(): boolean {
        if(!this.state.values.bundle){
            this.setState({
                errors: {
                    message: "missing bundle value"
                }
            });
            return false;
        }
        
        return true;
    }

    private async submitForm(): Promise<[IValidationResult]> {
        const r = Validator.execute(
            JSON.parse(this.state.values.bundle), 
            null, 
            this.props.action);
        return r;
    }

    render() {
        const { submitSuccess, submitResult, errors } = this.state;
        return (
            <form onSubmit={this.handleSubmit}>
                <div><label>Bundle:</label></div>
                <div>
                    <textarea
                        value={this.state.values.bundle}
                        onChange={this.handleChange}
                        rows={115}
                        cols={115}
                    />
                </div>
                <div><input type="submit" value="Submit" />
                    {submitSuccess === true && (
                        <div className="alert alert-info" role="alert">
                            <Card results={submitResult!}/>
                        </div>
                    )}
                </div>

                {submitSuccess === false &&
                    !this.haveErrors(errors) && (
                        <div className="alert alert-danger" role="alert">
                            Sorry, an unexpected error has occurred
                        </div>
                    )}
                {!submitSuccess &&
                    this.haveErrors(errors) && (
                        <div className="alert alert-danger" role="alert">
                            Sorry, the form is invalid. Please review, adjust and try again
                        </div>
                    )}
            </form>
        );
    }
}