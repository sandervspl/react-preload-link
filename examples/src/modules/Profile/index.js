import React from 'react';
import PT from 'prop-types';
import { connect } from 'react-redux';
import { getSwapiPerson } from '../../ducks/app';

class Profile extends React.Component {
    componentDidMount() {
        const { app, match: { params } } = this.props;

        if (!app.person) {
            this.props.getSwapiPerson(params.id);
        }
    }

    render() {
        const { app } = this.props;

        return (
            <div className="content">
                <h1>Profile</h1>
                {app.person && (
                    <ul>
                        {Object.keys(app.person).map((key) => (
                            <li key={key}>{app.person[key]}</li>
                        ))}
                    </ul>
                )}
            </div>
        );
    }
}

Profile.propTypes = {
    app: PT.object,
    getSwapiPerson: PT.func,
};

const mapStateToProps = (state) => ({
    app: state.app,
});

export default connect(mapStateToProps, { getSwapiPerson })(Profile);
