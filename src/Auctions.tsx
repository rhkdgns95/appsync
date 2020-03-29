import React from 'react';
import { listAuctions } from './graphql/queries';
import { useApolloClient } from 'react-apollo';
import { gql } from 'apollo-boost';
import { ListAuctionsQuery, ListAuctionsQueryVariables } from './API';
import AuctionCard from './AuctionCard';


const Auctions = () => {
    const client = useApolloClient();
    
    const data = client.readQuery<ListAuctionsQuery, ListAuctionsQueryVariables>({ query: gql(listAuctions) });

    console.log("DATA: ", data);
    
    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gridGap: 10,
        }}>
            {
                data?.listAuctions?.items?.map(item => 
                    <AuctionCard 
                        key={item!.id} 
                        { ...item! }
                    />
                )
            }
        </div>
    );
};

export default Auctions;