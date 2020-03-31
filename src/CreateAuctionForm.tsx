import React from 'react';
import { Formik } from 'formik';
import TextField from '@material-ui/core/TextField';
import Button from "@material-ui/core/Button";
import { Mutation } from "react-apollo";
import { createAuction } from './graphql/mutations';
import { gql } from 'apollo-boost';
import { CreateAuctionMutation, CreateAuctionMutationVariables } from './API';
import { listAuctions } from './graphql/queries';

interface IFormValue {
    name: string;
    price: number;
}

export const CreateAuctionForm = () => {
    return (
        <Mutation<CreateAuctionMutation, CreateAuctionMutationVariables> 
            mutation={gql(createAuction)}
            onCompleted={data => {
                console.log("CreateAuction onCompleted: ", data);
            }}
            onError={data => {
                console.log("CreateAuction onError: ", data);
            }}
        >
            {
                queryCreateAuction => (
                    <Formik<IFormValue> 
                        initialValues={{
                            name: "",
                            price: 0,
                        }}
                        
                        onSubmit={ async (input, { resetForm }) => {
                            const response = await queryCreateAuction({
                                variables: {
                                    input
                                },
                                refetchQueries: [
                                    { 
                                        query: gql(listAuctions), 
                                        variables: { limit: 100 }
                                    }
                                ],
                            });
                            console.log("onSubmit - inputs: ", input);
                            console.log("response: ", response);
                            resetForm();
                        }}
                        
                    >
                        {
                            ({ handleSubmit, values, handleChange }) => (
                                <form onSubmit={handleSubmit}>
                                    <TextField  
                                        name="name"
                                        label="Name"
                                        value={values.name}
                                        onChange={handleChange}
                                        margin="normal"
                                    />
                                    <br/>
                                    <TextField  
                                        name="price"
                                        type="number"
                                        label="Price"
                                        value={values.price}
                                        onChange={handleChange}
                                        margin="normal"
                                    />
                                    <br/>
                                    <Button type="submit" variant="contained" color="primary">
                                        Submit
                                    </Button>
                                </form>
                            )    
                        }
                    </Formik>   
                )
            }
        </Mutation>
    );
};