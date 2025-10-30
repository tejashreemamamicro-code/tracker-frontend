import React from 'react';
import { Dimmer, Loader } from 'semantic-ui-react';

const SemanticLoader = (props) => (
    <Dimmer active={props.loading ? true : false} inverted page={props?.fullPageLoader ? props?.fullPageLoader : false}>
        <Loader size='large' inverted>{props.loaderMessage} ...</Loader>
    </Dimmer>
);
export default SemanticLoader;