import React from 'react';
import PT from 'prop-types';

const Checkbox = ({ checked, onChange, id, name }) => (
    <div>
        <input
            type="checkbox"
            name="starwars-person"
            value={id}
            id={`person${id}`}
            onChange={onChange}
            checked={checked}
        />
        <label htmlFor={`person${id}`}>{name}</label>
    </div>
);

// eslint-disable-next-line object-curly-newline
const FetchForm = ({ personIdList, setPersonId }) => (
    <form className="fetch-form">
        <h4>People to fetch</h4>
        <Checkbox id={'1'} checked={personIdList.includes('1')} onChange={setPersonId} name="Luke Skywalker" />
        <Checkbox id={'2'} checked={personIdList.includes('2')} onChange={setPersonId} name="C-3PO" />
        <Checkbox id={'3'} checked={personIdList.includes('3')} onChange={setPersonId} name="R2-D2" />
    </form>
);

FetchForm.propTypes = {
    personIdList: PT.arrayOf(PT.string),
    setPersonId: PT.func,
};

export default FetchForm;
