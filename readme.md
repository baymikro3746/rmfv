# RMFV (React Material UI Form Validator)

React material ui form validator and form handler.

RMFV, doğrulama motoru olarak [Validator.js](https://github.com/chriso/validator.js) ve HTTP istekleri için [Axios](https://github.com/axios/axios) kullanır.


Bu [ÖZGÜR ÖZER]( https://github.com/ozgrozer ) Arkadaşımızın geliştirmiş olduğu form validator'dür. Gayet Başarılı ve düzgün çalışmakta aynı zamanda işlerimizi inanılmaz kolaylaştırmatadır. Bu konuda [Özgür]( https://github.com/ozgrozer ) arkadaşımızı tebrik ediyorum. Bu paketi Material UI react js için uyarlamaya çalıştım. Eksikleri olabilir bu konuda desteklerizi bekliyorum.


## Demo kullanım

[Demo Example](https://codesandbox.io/s/rmfv-htglu)

## Yükleme

YARN ile yükleme.

```sh
$ yarn add rmfv
```

NPM ile yükleme.

```sh
$ npm i rmfv
```

## Kullanım

Yalnızca form doğrulayıcı seçeneği.

```jsx
import React from 'react'
import ReactDOM from 'react-dom'

// Import package
import { Form, TextFld, TextMulti, TextSelect, TextSwitch, TextCheck } from './../src/Rmfv'
import { MenuItem, Button }  from '@material-ui/core/'

// Create validation rules (https://github.com/chriso/validator.js#validators)
const validations = {
  username: [
    {
      rule: 'isLength',
      args: { min: 1 },
      invalidFeedback: 'Boş Geçilemez'
    },
    {
      rule: 'isLength',
      args: { min: 4, max: 32 },
      invalidFeedback: 'Kullanıcı Adı minimum 4, maksimum 32 karakter olmalıdır'
    }
  ],
  aciklama: [
    {
      rule: 'isLength',
      args: { min: 1 },
      invalidFeedback: 'Boş Gecilemez'
    }
  ],
  gorevi: [
    {
      rule: 'isLength',
      args: { min: 1 },
      invalidFeedback: 'Boş Gecilemez'
    }
  ],
  Switch: [
    {
      rule: 'equals',
      args: 'on',
      invalidFeedback: 'Lütfen Onayla'
    }
  ],
  Check: [
    {
      rule: 'equals',
      args: 'on',
      invalidFeedback: 'Lütfen Onayla'
    }
  ],
}

const App = () => {

  const [switched, setSwitched] = useState('off')
  const [checked, setChecked] = useState('on')

  const preSubmit = (res) => {
    console.log('preSubmit', res)
  }

  const onSubmit = (res) => {
    console.log('onSubmit', res)
  }

  const postSubmit = (res) => {
    console.log('postSubmit', res)

    if (res.data.success) {
      res.setItems({})
    }
  }

  const postOptions = {
    method: 'post',
    url: 'https://rfv-demo-backend-kb3ppjk4g0ol.runkit.sh/test'
  }

  return (
    <Form
      preSubmit={preSubmit}
      onSubmit={onSubmit}
      postSubmit={postSubmit}
      postOptions={postOptions}>
      <h2>Demo Form</h2>

      <div>Type "john" into username to see the backend error.</div>

      <br />

      <div>
        <TextFld
          fullWidth
          id="username"
          variant="outlined"
          name='username'
          label='Username'
          validations={validations.username} />
      </div>

      <br />

      <div>
        <TextMulti
          fullWidth
          id="aciklama"
          rows="4"
          variant="outlined"
          name='aciklama'
          label='Aciklama'
          validations={validations.aciklama} />
      </div>

       <br />

      <div>
        <TextSelect
          fullWidth
          id="gorevi"
          select
          label="Görevini Seçiniz"
          name="gorevi"
          variant="outlined"
          validations={validations.gorevi} 
        >
          <MenuItem value="1">Evet</MenuItem>
          <MenuItem value="2">Hayır</MenuItem>
        </TextSelect>
      </div>

      <br />

      <div>
        <TextSwitch
          id="switch"
          color="primary" 
          value={switched}
          validations={validations.Switch} 
          name="switch">
          <label
            label="Switch"/>
        </TextSwitch>
      </div>

      <br />

      <div>
        <TextCheck
          id="checked"
          color="primary" 
          value={checked}
          validations={validations.Check} 
          name="Checked">
          <label
            label="Checked"/>
        </TextCheck>
      </div>

      <Button type="submit" variant="contained" color="primary">
        Gönder
      </Button>
    </Form>
  )
}

ReactDOM.render(<App />, document.getElementById('root'))
```

