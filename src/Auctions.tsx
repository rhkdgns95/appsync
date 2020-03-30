import React from 'react';
import { listAuctions } from './graphql/queries';
import AuctionCard from './AuctionCard';
import { Query } from 'react-apollo';
import { gql } from 'apollo-boost';
import {ListAuctionsQuery, ListAuctionsQueryVariables} from "./API";
import { OnMount } from './components/OnMount';
import { buildSubscription } from 'aws-appsync';
import { onCreateAuction } from './graphql/subscriptions';

const Auctions = () => {
    return (
        <Query<ListAuctionsQuery, ListAuctionsQueryVariables> 
            query={gql(listAuctions)}
            variables={{ limit: 100 }}
        >
            {
                ({ data, subscribeToMore }) => (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gridGap: 10,
                    }}>
                    <OnMount onEffect={() => {
                        const subscriptionQuery = gql(onCreateAuction);
                        const cacheUpdateQuery = gql(listAuctions);
                        return subscribeToMore(buildSubscription(subscriptionQuery, cacheUpdateQuery));
                    }}/>
                    {
                        data && data?.listAuctions?.items?.map((item: any) => 
                            <AuctionCard 
                                key={item!.id} 
                                { ...item! }
                            />
                        )
                    }
                    </div>
                )
            }
        </Query>
    );
};

export default Auctions;