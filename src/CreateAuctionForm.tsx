import React from 'react';
import { useFormik } from 'formik';
import TextField from '@material-ui/core/TextField';
import Button from "@material-ui/core/Button";
import { useMutation } from "react-apollo";
import { createAuction } from './graphql/mutations';
import { gql } from 'apollo-boost';
import { CreateAuctionMutation, CreateAuctionMutationVariables } from './API';

interface FormValue {
    name: string;
    price: number;
    title: string | null;
}
const useAuctionFormik = (queryCreateAuction: any) => {
    const formik = useFormik<FormValue>({
        initialValues: { name: "", price: 0, title: null },
        onSubmit: async input => {
            const response = await queryCreateAuction({
                variables: {
                    input
                }
            });
            console.log("onSubmit - inputs: ", input);
            console.log("response: ", response);
        }
    });
    
    return {
        formik
    };
}

export const CreateAuctionForm = () => {
    const [ queryCreateAuction ] = useMutation<CreateAuctionMutation, CreateAuctionMutationVariables>(gql(createAuction), {
        onCompleted: data => {
            console.log("CreateAuctionMutation onCompleted: ", data);
        },
        onError: data => {
            console.log("CreateAuctionMutation onError: ", data);
        }
    });    

    const { formik } = useAuctionFormik(queryCreateAuction);

    return (
        <form onSubmit={formik.handleSubmit}>
            <TextField  
                name="name"
                label="Name"
                value={formik.values.name}
                onChange={formik.handleChange}
                margin="normal"
            />
            <br/>
            <TextField  
                name="price"
                type="number"
                label="Price"
                value={formik.values.price}
                onChange={formik.handleChange}
                margin="normal"
            />
            <br/>
            <TextField  
                name="title"
                label="Title"
                value={formik.values.title || ""}
                onChange={formik.handleChange}
                margin="normal"
            />
            <br/>
            <Button type="submit" variant="contained" color="primary">
                Submit
            </Button>
        </form>
    )
};