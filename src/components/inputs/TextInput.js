/**
 * Copyright 2016 Reza (github.com/rghorbani)
 *
 * @flow
 */

'use strict';

const React = require('react');
const PropTypes = require('prop-types');
const _ = require('lodash');
const RNTextInput = require('react-native').TextInput;
const { Animated, StyleSheet } = require('react-native');

const BaseInput = require('./BaseInput');
const TextArea = require('./TextArea');
const Text = require('../text');
const View = require('../view');
const { Colors, Typography } = require('../../style');
const { Constants } = require('../../helpers');
const { Modal } = require('../../screen-components');

const DEFAULT_UNDERLINE_COLOR_BY_STATE = {
  default: Colors.dark70,
  focus: Colors.blue30,
  error: Colors.red30,
};
const charCountColorDefault = Colors.dark40;
const charCountColorLimit = Colors.red30;

class TextInput extends BaseInput {
  static displayName = 'TextInput';

  static propTypes = {
    ...RNTextInput.propTypes,
    ...BaseInput.propTypes,
    /**
     * make component rtl
     */
    rtl: PropTypes.bool,
    /**
     * should placeholder have floating behavior
     */
    floatingPlaceholder: PropTypes.bool,
    /**
     * floating placeholder color
     */
    floatingPlaceholderColor: PropTypes.string,
    /**
     * hide text input underline, by default false
     */
    hideUnderline: PropTypes.bool,
    /**
     * underline color in a string format or object of states - {default: 'black', error: 'red', focus: 'blue'}
     */
    underlineColor: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    /**
     * should text input be align to center
     */
    centered: PropTypes.bool,
    /**
     * input error message, should be empty if no error exists
     */
    error: PropTypes.string,
    /**
     * should the input component support error messages
     */
    enableErrors: PropTypes.bool,
    /**
     * should the input expand to another text area modal
     */
    expandable: PropTypes.bool,
    /**
     * transform function executed on value and return transformed value
     */
    transformer: PropTypes.func,
    /**
     * Fixed title that will displayed above the input (note: floatingPlaceholder MUST be 'false')
     */
    title: PropTypes.string,
    /**
     * The title's color
     */
    titleColor: PropTypes.string,
    /**
     * should the input display a character counter (only when passing 'maxLength')
     */
    showCharacterCounter: PropTypes.bool,
    /**
     * Use to identify the component in tests
     */
    testId: PropTypes.string,
  };

  static defaultProps = {
    placeholderTextColor: Colors.dark40,
    floatingPlaceholderColor: Colors.dark40,
    titleColor: Colors.dark40,
    enableErrors: true,
  };

  constructor(props) {
    super(props);

    this.onChangeText = this.onChangeText.bind(this);
    this.onChange = this.onChange.bind(this);
    this.onDoneEditingExpandableInput = this.onDoneEditingExpandableInput.bind(this);
    this.updateFloatingPlaceholderState = this.updateFloatingPlaceholderState.bind(this);
    this.toggleExpandableModal = this.toggleExpandableModal.bind(this);

    // const typography = this.getTypography();
    this.state = {
      // inputWidth: typography.fontSize * 2,
      value: props.value,
      floatingPlaceholderState: new Animated.Value(
        this.hasText(props.value) ? 1 : 0,
      ),
      showExpandableModal: false,
    };

    this.generatePropsWarnings(props);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.rtl !== this.props.rtl) {
      this.styles = createStyles({
        ...this.props,
        rtl: nextProps.rtl,
      });
    }
    if (nextProps.value !== this.props.value) {
      this.setState(
        {
          value: nextProps.value,
        },
        this.updateFloatingPlaceholderState,
      );
    }
  }

  componentDidMount() {
    this.getHeight();
  }

  generatePropsWarnings(props) {
    if (props.maxLength === 0) {
      console.warn('Setting maxLength to zero will block typing in this input');
    }
    if (props.showCharacterCounter && !props.maxLength) {
      console.warn("In order to use showCharacterCount please pass 'maxLength' prop");
    }
  }

  generateStyles() {
    this.styles = createStyles(this.props);
  }

  getUnderlineStyle() {
    const {focused} = this.state;
    const {error, underlineColor} = this.props;

    const underlineColorByState = _.cloneDeep(DEFAULT_UNDERLINE_COLOR_BY_STATE);
    if (underlineColor) {
      if (_.isString(underlineColor)) {
        // use given color for any state
        return {borderColor: underlineColor};
      } else if (_.isObject(underlineColor)) {
        _.merge(underlineColorByState, underlineColor);
      }
    }

    let borderColor = underlineColorByState.default;
    if (error) {
      borderColor = underlineColorByState.error;
    } else if (focused) {
      borderColor = underlineColorByState.focus;
    }

    // return the right color for the current state
    return {borderColor};
  }

  getCharCount() {
    const {value} = this.state;
    return _.size(value);
  }

  isCounterLimit() {
    const {maxLength} = this.props;
    const counter = this.getCharCount();
    return counter === 0 ? false : maxLength === counter;
  }

  hasText(value) {
    return !_.isEmpty(value || this.state.value);
  }

  shouldFakePlaceholder() {
    const {floatingPlaceholder, centered} = this.props;
    return Boolean(floatingPlaceholder && !centered);
  }

  getHeight() {
    const {multiline} = this.props;
    if (!multiline) {
      const typography = this.getTypography();
      return typography.lineHeight;
    }
  }

  getLinesHeightLimit() {
    let maxHeight;
    const {multiline, numberOfLines} = this.props;
    if (multiline && numberOfLines) {
      const typography = this.getTypography();
      maxHeight = typography.lineHeight * numberOfLines;
    }
    return maxHeight;
  }

  renderPlaceholder() {
    const {floatingPlaceholderState} = this.state;
    const {
      centered,
      expandable,
      placeholder,
      placeholderTextColor,
      floatingPlaceholderColor,
      multiline,
    } = this.props;
    const typography = this.getTypography();
    const floatingTypography = Typography.text90;

    if (this.shouldFakePlaceholder()) {
      return (
        <Animated.Text
          style={[
            this.styles.placeholder,
            typography,
            centered && this.styles.placeholderCentered,
            !centered && {
              top: floatingPlaceholderState.interpolate({
                inputRange: [0, 1],
                outputRange: [multiline ? 30 : 23, multiline ? 7 : 0],
              }),
              fontSize: floatingPlaceholderState.interpolate({
                inputRange: [0, 1],
                outputRange: [typography.fontSize, floatingTypography.fontSize],
              }),
              color: floatingPlaceholderState.interpolate({
                inputRange: [0, 1],
                outputRange: [placeholderTextColor, floatingPlaceholderColor],
              }),
              lineHeight: this.hasText()
                ? floatingTypography.lineHeight
                : typography.lineHeight,
            },
          ]}
          onPress={() => expandable && this.toggleExpandableModal(true)}
        >
          {placeholder}
        </Animated.Text>
      );
    }
  }

  renderTitle() {
    const {floatingPlaceholder, title} = this.props;
    if (!floatingPlaceholder && title) {
      const capitalizedTitle = _.capitalize(title);
      return (
        <Text
          style={this.styles.title}
        >
          {capitalizedTitle}
        </Text>
      );
    }
  }

  renderCharCounter() {
    const {focused} = this.state;
    const {maxLength, showCharacterCounter} = this.props;
    if (maxLength && showCharacterCounter) {
      const counter = this.getCharCount();
      const color = this.isCounterLimit() && focused ? charCountColorLimit : charCountColorDefault;
      return (
        <Text
          style={[{color}, this.styles.charCounter]}
        >
          {counter} / {maxLength}
        </Text>
      );
    }
  }

  renderError() {
    const {enableErrors, error} = this.props;
    if (enableErrors) {
      return (
        <Text style={this.styles.errorMessage}>
          {error}
        </Text>
      );
    }
  }

  renderExpandableModal() {
    const {showExpandableModal} = this.state;
    return (
      <Modal
        animationType={'slide'}
        visible={showExpandableModal}
        onRequestClose={() => this.toggleExpandableModal(false)}
      >
        <Modal.TopBar
          onCancel={() => this.toggleExpandableModal(false)}
          onDone={this.onDoneEditingExpandableInput}
        />
        <View style={this.styles.expandableModalContent}>
          <TextArea
            ref={(textarea) => {
              this.expandableInput = textarea;
            }}
            {...this.props}
            value={this.state.value}
          />
        </View>
      </Modal>
    );
  }

  renderExpandableInput() {
    const {floatingPlaceholder, placeholder} = this.props;
    const {value} = this.state;
    const typography = this.getTypography();
    const minHeight = typography.lineHeight;
    const shouldShowPlaceholder = _.isEmpty(value) && !floatingPlaceholder;

    return (
      <Text
        style={[
          this.styles.input,
          typography,
          {minHeight},
          shouldShowPlaceholder && this.styles.placeholder,
        ]}
        numberOfLines={3}
        onPress={() => this.toggleExpandableModal(true)}
      >
        {shouldShowPlaceholder ? placeholder : value}
      </Text>
    );
  }

  renderTextInput() {
    const {value} = this.state;
    const color = this.props.color || this.extractColorValue();
    const typography = this.getTypography();
    const {
      style,
      placeholder,
      floatingPlaceholder,
      centered,
      multiline,
      numberOfLines,
      ...props
    } = this.props;
    const inputStyle = [
      this.styles.input,
      typography,
      color && {color},
      {height: this.getHeight()},
      style,
    ];

    return (
      <RNTextInput
        {...props}
        value={value}
        placeholder={floatingPlaceholder && !centered ? undefined : placeholder}
        underlineColorAndroid="transparent"
        style={inputStyle}
        multiline={multiline}
        numberOfLines={numberOfLines}
        onChangeText={this.onChangeText}
        onChange={this.onChange}
        onFocus={this.onFocus}
        onBlur={this.onBlur}
        ref={(input) => {
          this.input = input;
        }}
      />
    );
  }

  render() {
    const {expandable, containerStyle} = this.props;
    const underlineStyle = this.getUnderlineStyle();

    return (
      <View style={[this.styles.container, containerStyle]} collapsable={false}>
        {this.renderTitle()}
        <View style={[this.styles.innerContainer, underlineStyle]}>
          {this.renderPlaceholder()}
          {expandable ? this.renderExpandableInput() : this.renderTextInput()}
          {this.renderExpandableModal()}
        </View>
        <View row style={this.styles.errorContainer}>
          <View flex>
            {this.renderError()}
          </View>
          {this.renderCharCounter()}
        </View>
      </View>
    );
  }

  toggleExpandableModal(value) {
    this.setState({showExpandableModal: value});
  }

  updateFloatingPlaceholderState(withoutAnimation) {
    if (withoutAnimation) {
      this.state.floatingPlaceholderState.setValue(this.hasText() ? 1 : 0);
    } else {
      Animated.spring(this.state.floatingPlaceholderState, {
        toValue: this.hasText() ? 1 : 0,
        duration: 150,
      }).start();
    }
  }

  onDoneEditingExpandableInput() {
    const expandableInputValue = _.get(this.expandableInput, 'state.value');
    this.setState({
      value: expandableInputValue,
    });
    this.state.floatingPlaceholderState.setValue(expandableInputValue ? 1 : 0);
    _.invoke(this.props, 'onChangeText', expandableInputValue);
    this.toggleExpandableModal(false);
  }

  onChangeText(text) {
    let transformedText = text;
    const {transformer} = this.props;
    if (_.isFunction(transformer)) {
      transformedText = transformer(text);
    }

    _.invoke(this.props, 'onChangeText', transformedText);

    this.setState(
      {
        value: transformedText,
      },
      this.updateFloatingPlaceholderState,
    );
  }

  onChange(event) {
    _.invoke(this.props, 'onChange', event);
  }
}

function createStyles({
  rtl,
  placeholderTextColor,
  hideUnderline,
  centered,
  floatingPlaceholder,
  titleColor,
}) {
  return StyleSheet.create({
    container: {
    },
    innerContainer: {
      flexDirection: 'row',
      borderBottomWidth: hideUnderline ? 0 : 1,
      borderColor: Colors.dark70,
      justifyContent: centered ? 'center' : (rtl ? 'flex-end' : undefined),
      paddingTop: floatingPlaceholder ? 25 : undefined,
      flexGrow: 1,
    },
    focusedUnderline: {
      borderColor: Colors.blue30,
    },
    errorUnderline: {
      borderColor: Colors.red30,
    },
    input: {
      flex: 1,
      marginBottom: hideUnderline ? undefined : 10,
      padding: 0,
      textAlign: centered ? 'center' : (rtl ? 'right' : undefined),
      writingDirection: rtl ? 'rtl' : undefined,
      backgroundColor: 'transparent',
    },
    placeholder: {
      position: 'absolute',
      color: placeholderTextColor,
      textAlign: rtl ? 'right' : undefined,
      writingDirection: rtl ? 'rtl' : undefined,
    },
    placeholderCentered: {
      left: 0,
      right: 0,
      textAlign: 'center',
    },
    errorContainer: {
      flexDirection: rtl ? 'row-reverse' : 'row',
    },
    errorMessage: {
      color: Colors.red30,
      textAlign: centered ? 'center' : (rtl ? 'right' : undefined),
      ...Typography.text90,
      height: Typography.text90.lineHeight,
      writingDirection: rtl ? 'rtl' : undefined,
      marginTop: 1,
    },
    expandableModalContent: {
      flex: 1,
      paddingTop: 15,
      paddingHorizontal: 20,
    },
    title: {
      top: 0,
      color: titleColor,
      textAlign: rtl ? 'right' : undefined,
      writingDirection: rtl ? 'rtl' : undefined,
      ...Typography.text90,
      height: Typography.text90.lineHeight,
      marginBottom: Constants.isIOS ? 5 : 4,
    },
    charCounter: {
      ...Typography.text90,
      height: Typography.text90.lineHeight,
      marginTop: 1,
    },
  });
}

module.exports = TextInput;
