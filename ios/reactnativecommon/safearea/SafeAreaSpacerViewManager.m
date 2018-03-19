//
//  SafeAreaSpacerViewManager.m
//  RNCommon
//
//  Created by Reza on 3/19/18.
//  Copyright © 2018 kajoo. All rights reserved.
//

#import "SafeAreaSpacerViewManager.h"

#import "SafeAreaSpacerShadowView.h"
#import "SafeAreaSpacerView.h"
#import <React/RCTUIManager.h>

@implementation SafeAreaSpacerViewManager

RCT_EXPORT_MODULE()

- (dispatch_queue_t)methodQueue
{
    return dispatch_get_main_queue();
}

- (UIView *)view
{
    return [[SafeAreaSpacerView alloc] initWithBridge:self.bridge];
}

- (SafeAreaSpacerShadowView *)shadowView
{
    return [SafeAreaSpacerShadowView new];
}

@end
