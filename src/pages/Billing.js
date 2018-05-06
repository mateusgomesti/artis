import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { connect } from 'react-redux'
import Form from 'react-vanilla-form'
import {
  isEmpty,
  isNil,
  merge,
  omit,
  propOr,
  reject,
} from 'ramda'
import {
  Button,
  Switch,
  FormInput,
  ThemeConsumer,
} from 'former-kit'

import options from '../utils/data/states'
import { removeMask } from '../utils/masks/'
import getAddress from '../utils/helpers/getAddress'
import { addPageInfo, toggleCart } from '../actions'
import {
  required,
  isNumber,
  minLength,
  maxLength,
} from '../utils/validations'

import NavigateBack from './../../src/images/navigate_back.svg'
import NavigateNext from './../../src/images/navigate_next.svg'
import CartIcon from './../../src/images/cart.svg'

const consumeTheme = ThemeConsumer('UIAddressesPage')

class BillingPage extends Component {
  constructor (props) {
    super(props)

    const { billing } = props

    this.state = {
      ...billing,
      sameAddressForShipping: propOr(true, 'sameAddressForShipping', billing),
    }
  }

  componentWillUnmount () {
    this.props.handlePageChange({
      page: 'billing',
      pageInfo: this.state,
    })

    if (this.state.sameAddressForShipping) {
      this.props.handlePageChange({
        page: 'shipping',
        pageInfo: this.state,
      })
    }
  }

  autocompleteAddress (zipcode) {
    const updateAddress = (address) => {
      const newZipcode = address.cep

      const newAddress = merge(
        omit(['cep'], address),
        {
          zipcode: newZipcode,
          number: '',
          complement: '',
          isSearchingCPF: false,
        }
      )

      this.setState(newAddress)

      this.numberInput.focus()
    }

    const handleError = error =>
      this.setState({
        error: error.message,
        isSearchingCPF: false,
      })

    this.setState({ isSearchingCPF: true }, () => (
      getAddress(zipcode)
        .then(updateAddress)
        .catch(handleError)
    ))
  }

  handleNumberInputRef = (input) => {
    this.numberInput = input
  }

  handleSameAddressChange = (value) => {
    this.setState({ sameAddressForShipping: value })
  }

  handleChangeForm = (values, errors) => {
    const {
      zipcode: oldZipcode,
    } = this.state

    this.setState({
      ...values,
      formValid: isEmpty(reject(isNil, errors)),
    }, () => {
      if (values.zipcode !== oldZipcode &&
        removeMask(values.zipcode).length === 8) {
        this.autocompleteAddress(values.zipcode)
      }
    })
  }

  render () {
    const {
      sameAddressForShipping,
      isSearchingCPF,
    } = this.state

    const {
      theme,
      handlePreviousButton,
      allowSwitchChooseSameAddress,
      openCart,
    } = this.props

    const buttonContainerClasses = classNames(theme.buttonContainer, {
      [theme.hidePrevButton]: isNil(handlePreviousButton),
    })

    return (
      <Form
        data={this.state}
        className={theme.addressForm}
        onChange={this.handleChangeForm}
        onSubmit={this.props.handleSubmit}
        customErrorProp="error"
        validation={{
          zipcode: [
            required,
            minLength(8),
            maxLength(8),
          ],
          number: [
            required,
            isNumber,
            minLength(1),
            maxLength(5),
          ],
          street: [
            required,
            minLength(10),
            maxLength(40),
          ],
          city: [
            required,
            minLength(4),
            maxLength(25),
          ],
          state: [
            required,
            maxLength(19),
          ],
        }}
      >
        <h2 className={theme.title}>
          Qual é seu endereço de cobrança?
        </h2>
        <div className={theme.inputsContainer}>
          <FormInput
            disabled={isSearchingCPF}
            name="zipcode"
            label="CEP"
            mask="11111-111"
          />
          <FormInput
            disabled={isSearchingCPF}
            name="street"
            label="Rua"
            placeholder="Digite o endereço"
          />
          <div className={theme.inputGroup}>
            <FormInput
              inputRef={this.handleNumberInputRef}
              name="number"
              className={theme.fieldNumber}
              label="Nº"
              placeholder="Digite o número"
              type="number"
            />
            <FormInput
              name="complement"
              className={theme.fieldComplement}
              label="Complemento"
              placeholder="Digite o complemento do endereço"
            />
          </div>
          <div className={theme.inputGroup}>
            <FormInput
              disabled={isSearchingCPF}
              name="city"
              className={theme.fieldCity}
              label="Cidade"
              placeholder="Digite a cidade"
            />
            <FormInput
              disabled={isSearchingCPF}
              options={options}
              name="state"
              className={theme.fieldState}
              label="Estado"
              placeholder="Escolha a UF"
            />
          </div>
          {
            allowSwitchChooseSameAddress && <div className={theme.inputGroup}>
              <p className={theme.switchLabel} >Entregar no mesmo endereço?</p>
              <Switch
                checked={sameAddressForShipping}
                onChange={this.handleSameAddressChange}
                strings={{
                  on: 'Sim',
                  off: 'Não',
                }}
              />
            </div>
          }
        </div>
        <div className={buttonContainerClasses}>
          <Button
            fill="outline"
            onClick={handlePreviousButton}
            icon={<NavigateBack />}
          >
            Ops, voltar
          </Button>
          <Button
            fill="gradient"
            onClick={openCart}
            icon={<CartIcon />}
          />
          <Button
            fill="gradient"
            type="submit"
            iconAlignment="end"
            icon={<NavigateNext />}
            disabled={!this.state.formValid}
          >
            Continuar
          </Button>
        </div>
      </Form>
    )
  }
}

BillingPage.propTypes = {
  theme: PropTypes.shape({
    addressForm: PropTypes.string,
    inputsContainer: PropTypes.string,
    buttonContainer: PropTypes.string,
    fieldNumber: PropTypes.string,
    fieldComplement: PropTypes.string,
    fieldCity: PropTypes.string,
    fieldState: PropTypes.string,
    inputGroup: PropTypes.string,
    switchLabel: PropTypes.string,
  }),
  handleSubmit: PropTypes.func.isRequired,
  handlePageChange: PropTypes.func.isRequired,
  handlePreviousButton: PropTypes.func.isRequired,
  allowSwitchChooseSameAddress: PropTypes.bool,
  billing: PropTypes.shape({
    name: PropTypes.string,
    street: PropTypes.string,
    number: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]),
    complement: PropTypes.string,
    city: PropTypes.string,
    state: PropTypes.string,
    zipcode: PropTypes.string,
  }),
  openCart: PropTypes.func,
}

BillingPage.defaultProps = {
  theme: {},
  billing: {},
  allowSwitchChooseSameAddress: true,
  openCart: null,
}

const mapStateToProps = ({ pageInfo }) => ({
  billing: pageInfo.billing,
})

export default connect(mapStateToProps, {
  handlePageChange: addPageInfo,
  openCart: toggleCart,
})(consumeTheme(BillingPage))
