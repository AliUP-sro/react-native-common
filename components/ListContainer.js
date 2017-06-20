/**
 * Copyright 2016 Reza (github.com/rghorbani)
 *
 * @flow
 */
'use strict';


var React = require('React');
var {
  Platform,
  Image,
  NativeModules,
  TouchableOpacity,
  View,
} = require('react-native');
var {
  RGFHeader,
  Text,
  StyleSheet,
} = require('RNCCommon');

import type {Item as HeaderItem} from 'RGFHeader';

type Props = {
  title: string;
  leftItem?: HeaderItem;
  rightItem?: HeaderItem;
  extraItems?: Array<HeaderItem>;
  selectedSectionColor: string;
  backgroundImage: number;
  backgroundColor: string;
  children?: any;
};

class ListContainer extends React.Component {
  props: Props;

  static defaultProps = {
    selectedSectionColor: 'white',
  };

  static contextTypes = {
    openDrawer: React.PropTypes.func,
    hasUnreadNotifications: React.PropTypes.number,
  };

  constructor(props: Props) {
    super(props);

    (this: any).handleShowMenu = this.handleShowMenu.bind(this);
    (this: any).renderButton = this.renderButton.bind(this);
  }

  render() {
    var leftItem = this.props.leftItem;
    if (!leftItem && Platform.OS === 'android') {
      leftItem = {
        layout: 'icon',
        title: 'Menu',
        icon: this.context.hasUnreadNotifications
          ? require('./img/hamburger-unread.png')
          : require('./img/hamburger.png'),
        onPress: this.handleShowMenu,
      };
    }

    return (
      <View style={[styles.container, this.props.style]}>
        <View style={styles.headerWrapper}>
          <RGFHeader
            title={this.props.title}
            leftItem={leftItem}
            rightItem={this.props.rightItem}
            extraItems={this.props.extraItems}>
          </RGFHeader>
        </View>
        <View style={styles.content}>
          {this.props.children}
        </View>
        {this.renderButton()}
      </View>
    );
  }

  handleShowMenu() {
    this.context.openDrawer();
  }

  renderButton() {
    if (Platform.OS === 'ios' || this.props.onPress === undefined) {
      return null;
    }

    return (
      <TouchableOpacity
        style={styles.addButton}
        onPress={this.props.onPress}>
        <Image
          source={require('../views/img/add_transaction.png')}
        />
      </TouchableOpacity>
    );
  }
}

var styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  content: {
    flex: 1,
  },
  headerWrapper: {
    android: {
      elevation: 2,
      backgroundColor: 'transparent',
      // FIXME: elevation doesn't seem to work without setting border
      borderRightWidth: 1,
      marginRight: -1,
      borderRightColor: 'transparent',
    }
  },
  addButton: {
    position: 'absolute',
    bottom: 10,
    left: 10,
  },
});

module.exports = ListContainer;