import React from 'react';
import PT from 'prop-types';
import { connect } from 'react-redux';
import { getSwapiPerson } from '../../ducks/swapi';

class Profile extends React.Component {
    componentDidMount() {
        const { swapi, match: { params } } = this.props;

        const idList = params.id.split(',');

        if (swapi.people.length === 0) {
            idList.forEach(id => this.props.getSwapiPerson(id));
        }
    }

    render() {
        const { swapi } = this.props;

        return (
            <div className="content">
                {swapi.loading && <p>Loading...</p>}

                {swapi.people.length > 0 && swapi.people.map((person) => (
                    <React.Fragment key={person.name}>
                        <h2>{person.name}</h2>
                        <ul>
                            {Object.keys(person)
                                .filter(key => person[key] && !Array.isArray(person[key]))
                                .map((key) => (
                                    <li key={key}>
                                        <span className="property">{key.replace('_', ' ')}</span>
                                        <span className="value">{person[key]}</span>
                                    </li>
                                ))}
                        </ul>
                    </React.Fragment>
                ))}
            </div>
        );
    }
}

Profile.propTypes = {
    swapi: PT.shape({
        people: PT.arrayOf(PT.object),
    }),
    match: PT.shape({
        params: PT.object,
    }),
    getSwapiPerson: PT.func,
};

const mapStateToProps = (state) => ({
    swapi: state.swapi,
});

export default connect(mapStateToProps, { getSwapiPerson })(Profile);
