var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

import React, { Fragment, useEffect, useState } from 'react';
import validator from 'validator';
import axios from 'axios';
import { TextField, MenuItem, FormControl, FormControlLabel, FormHelperText, FormGroup, Switch, Checkbox } from '@material-ui/core';

const Form = props => {
  const { runValidation, preSubmit, onSubmit, postSubmit, postOptions, store } = props,
        htmlProps = _objectWithoutProperties(props, ['runValidation', 'preSubmit', 'onSubmit', 'postSubmit', 'postOptions', 'store']);

  useEffect(() => {
    store.runValidation(runValidation);
  }, [runValidation]);

  return React.createElement(
    'form',
    _extends({
      noValidate: true
    }, htmlProps, {
      onSubmit: e => store.formOnSubmit({ preSubmit, onSubmit, postSubmit, postOptions }, e) }),
    props.children
  );
};

const Item = props => {
  const { opts, store, validations, className, onChange } = props,
        htmlProps = _objectWithoutProperties(props, ['opts', 'store', 'validations', 'className', 'onChange']);

  useEffect(() => {
    store.itemInitialize(props);
  }, [props.value]);

  const thisItem = store.state.items[props.name] || {
    value: '',
    className: '',
    invalidFeedback: ''
  };

  const itemClassName = (className || '') + (thisItem.className ? (className ? ' ' : '') + thisItem.className : '');

  let formElement;
  if (opts.element === 'textField') {
    formElement = React.createElement(TextField, _extends({}, htmlProps, {
      value: thisItem.value,
      onChange: e => store.itemOnChange({ props, e, onChange }),
      helperText: thisItem.invalidFeedback ? thisItem.invalidFeedback : null,
      error: thisItem.invalidFeedback ? 'error' : null }));
  } else if (opts.element === 'textarea') {
    formElement = React.createElement(TextField, _extends({}, htmlProps, {
      multiline: true,
      variant: 'outlined',
      value: thisItem.value,
      onChange: e => store.itemOnChange({ props, e, onChange }),
      helperText: thisItem.invalidFeedback ? thisItem.invalidFeedback : null,
      error: thisItem.invalidFeedback ? 'error' : null }));
  } else if (opts.element === 'select') {
    formElement = React.createElement(
      TextField,
      _extends({}, htmlProps, {
        value: thisItem.value,
        onChange: e => store.itemOnChange({ props, e, onChange }),
        helperText: thisItem.invalidFeedback ? thisItem.invalidFeedback : null,
        error: thisItem.invalidFeedback ? 'error' : null }),
      props.children
    );
  } else if (opts.element === 'switch') {
    formElement = React.createElement(
      FormControl,
      { component: 'fieldset' },
      React.createElement(
        FormGroup,
        null,
        React.createElement(FormControlLabel, _extends({}, props.children.props, {
          control: React.createElement(Switch, _extends({}, htmlProps, {
            value: thisItem.value,
            checked: thisItem.value === 'on',
            onChange: e => store.itemOnChange({ props, e, onChange }) }))
        }))
      ),
      thisItem.invalidFeedback ? React.createElement(
        FormHelperText,
        { error: 'error', style: { marginLeft: '13px' } },
        thisItem.invalidFeedback
      ) : null
    );
  } else if (opts.element === 'checked') {
    formElement = React.createElement(
      FormControl,
      { component: 'fieldset' },
      React.createElement(
        FormGroup,
        null,
        React.createElement(FormControlLabel, _extends({}, props.children.props, {
          control: React.createElement(Checkbox, _extends({}, htmlProps, {
            value: thisItem.value,
            checked: thisItem.value === 'on',
            onChange: e => store.itemOnChange({ props, e, onChange }) }))
        }))
      ),
      thisItem.invalidFeedback ? React.createElement(
        FormHelperText,
        { error: 'error', style: { marginLeft: '13px' } },
        thisItem.invalidFeedback
      ) : null
    );
  }

  return React.createElement(
    Fragment,
    null,
    formElement
  );
};

const TextFld = props => React.createElement(Item, _extends({}, props, { opts: { element: 'textField' } }));
const TextMulti = props => React.createElement(Item, _extends({}, props, { opts: { element: 'textarea' } }));
const TextSelect = props => React.createElement(Item, _extends({}, props, { opts: { element: 'select' } }));
const TextSwitch = props => React.createElement(Item, _extends({}, props, { opts: { element: 'switch' } }));
const TextCheck = props => React.createElement(Item, _extends({}, props, { opts: { element: 'checked' } }));

const Context = React.createContext();

const Provider = props => {
  const [items, setItems] = useState({});
  const [interestingBug, setInterestingBug] = useState('');
  const [formIsValidating, setFormIsValidating] = useState(false);

  const itemValidate = opts => {
    const item = items[opts.name];

    item.validations.map((itemValidation, i) => {
      const validate = validator[itemValidation.rule](item.value, itemValidation.args);
      if (validate) {
        itemValidation.validated = true;
      } else {
        itemValidation.validated = false;
      }
    });

    const unvalidatedItems = [];
    item.validations.map((itemValidation, i) => {
      if (!itemValidation.validated) {
        unvalidatedItems.push(itemValidation);
      }
    });

    item.validated = !unvalidatedItems.length || false;
  };

  const formUnvalidate = () => {
    Object.keys(items).map(key => {
      const item = items[key];
      item.className = '';
    });
    setItems(items);
  };

  const formValidate = () => {
    let howManyItemsValidated = 0;
    let howManyItemsAreGonnaValidate = 0;

    Object.keys(items).map(key => {
      const item = items[key];

      item.validations.map((itemValidation, i) => {
        howManyItemsAreGonnaValidate++;

        const validate = validator[itemValidation.rule](item.value, itemValidation.args);
        if (validate) {
          itemValidation.validated = true;
          howManyItemsValidated++;
        } else {
          itemValidation.validated = false;
        }
      });

      const unvalidatedItems = [];
      item.validations.map((itemValidation, i) => {
        if (!itemValidation.validated) {
          unvalidatedItems.push(itemValidation);
        }
      });

      if (unvalidatedItems.length) {
        item.invalidFeedback = unvalidatedItems[0].invalidFeedback;
        item.className = 'is-invalid';
      }
    });

    setItems(items);

    return howManyItemsAreGonnaValidate === howManyItemsValidated || false;
  };

  const formOnSubmit = (opts, e) => {
    e.preventDefault();

    if (opts.preSubmit) {
      opts.preSubmit({
        e,
        setItems: itemSet,
        items: itemsAndValues()
      });
    }

    setFormIsValidating(true);

    const isFormValid = formValidate();

    if (opts.onSubmit) {
      opts.onSubmit({
        e,
        setItems: itemSet,
        items: itemsAndValues(),
        isFormValid: isFormValid
      });
    }

    if (isFormValid && opts.postOptions) {
      opts.postOptions.data = itemsAndValues();

      axios(_extends({}, opts.postOptions)).then(res => {
        const validations = res.data.validations || {};

        let isPostSubmitFormValid = true;
        if (Object.keys(validations).length) {
          isPostSubmitFormValid = false;

          Object.keys(validations).map(key => {
            items[key].invalidFeedback = validations[key];
            items[key].className = 'is-invalid';
          });

          const newItems = Object.assign({}, items);
          setItems(newItems);
        }

        if (opts.postSubmit) {
          opts.postSubmit({
            e,
            isFormValid,
            data: res.data,
            setItems: itemSet,
            isPostSubmitFormValid,
            items: itemsAndValues()
          });
        }
      }).catch(err => {
        if (opts.postSubmit) {
          opts.postSubmit({
            error: err,
            isFormValid,
            setItems: itemSet,
            items: itemsAndValues()
          });
        }
      });
    }
  };

  const itemsAndValues = () => {
    const data = {};

    Object.keys(items).map(key => {
      const item = items[key];
      data[key] = item.value;
    });

    return data;
  };

  const itemInitialize = item => {
    console.log(item.checked);
    let itemValue = item.value || '';
    if (item.opts.element === 'switch') {
      if (Object.prototype.hasOwnProperty.call(item, 'checked')) {
        itemValue = item.checked ? 'on' : 'off';
      }
    }

    if (item.opts.element === 'checked') {
      if (Object.prototype.hasOwnProperty.call(item, 'checked')) {
        itemValue = item.checked ? 'on' : 'off';
      }
    }

    items[item.name] = {
      value: itemValue,
      validations: item.validations || []
    };

    setInterestingBug(itemValue);

    const newItems = Object.assign({}, items);
    setItems(newItems);

    if (formIsValidating) formValidate();

    console.log(itemValue);
  };

  const itemOnChange = opts => {
    const item = _extends({}, opts.props, {
      checked: opts.e.target.checked,
      value: opts.e.target.value
    });

    itemInitialize(item);

    if (opts.onChange) {
      itemValidate({ name: opts.props.name });
      opts.onChange({ e: opts.e, validated: items[opts.props.name].validated });
    }
  };

  const itemSet = opts => {
    if (opts) {
      const optsKeys = Object.keys(opts);
      const itemKeys = Object.keys(items);

      if (optsKeys.length) {
        itemKeys.map(key => {
          const item = items[key];

          if (opts.hasOwnProperty(key)) {
            item.value = opts[key];
          }
        });
      } else {
        itemKeys.map(key => {
          const item = items[key];
          item.value = '';
        });
      }

      setItems(items);
    }
  };

  const runValidation = trueFalse => {
    setFormIsValidating(trueFalse);
    if (trueFalse) {
      formValidate();
    } else {
      formUnvalidate();
    }
  };

  const store = {
    formOnSubmit,
    itemInitialize,
    itemOnChange,
    runValidation,
    setItems: itemSet,
    state: { items }
  };

  return React.createElement(
    Context.Provider,
    { value: store },
    props.children
  );
};

const connectProvider = Component => {
  return props => React.createElement(
    Provider,
    null,
    React.createElement(
      Context.Consumer,
      null,
      store => React.createElement(Component, _extends({}, props, { store: store }))
    )
  );
};

const connectConsumer = Component => {
  return props => React.createElement(
    Context.Consumer,
    null,
    store => React.createElement(Component, _extends({}, props, { store: store }))
  );
};

module.exports = {
  Form: connectProvider(Form),
  TextFld: connectConsumer(TextFld),
  TextMulti: connectConsumer(TextMulti),
  TextSelect: connectConsumer(TextSelect),
  TextSwitch: connectConsumer(TextSwitch),
  TextCheck: connectConsumer(TextCheck)
};

