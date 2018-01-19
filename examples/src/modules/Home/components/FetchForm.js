import React from 'react';
import PT from 'prop-types';

// eslint-disable-next-line object-curly-newline
const FetchForm = ({ personId, setPersonId }) => (
    <form>
        <div>
            <input
                type="radio"
                name="starwars-person"
                value="1"
                id="person1"
                onChange={setPersonId}
                checked={personId === '1'}
            />
            <label htmlFor="person1">Luke Skywalker</label>
        </div>

        <div>
            <input
                type="radio"
                name="starwars-person"
                value="2"
                id="person2"
                onChange={setPersonId}
                checked={personId === '2'}
            />
            <label htmlFor="person2">C-3PO</label>
        </div>

        <div>
            <input
                type="radio"
                name="starwars-person"
                value="3"
                id="person3"
                onChange={setPersonId}
                checked={personId === '3'}
            />
            <label htmlFor="person3">R2-D2</label>
        </div>
    </form>
);

FetchForm.propTypes = {
    personId: PT.string,
    setPersonId: PT.func,
};

export default FetchForm;
