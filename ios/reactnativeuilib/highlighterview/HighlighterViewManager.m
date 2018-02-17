//
//  HighlighterViewManager.m
//  RNCommon
//
//  Created by Reza on 2/17/18.
//  Copyright © 2018 kajoo. All rights reserved.
//

#import "HighlighterViewManager.h"
#import "HighlighterView.h"

@implementation HighlighterViewManager

RCT_EXPORT_MODULE()

- (dispatch_queue_t)methodQueue {
    return dispatch_get_main_queue();
}

- (UIView *)view
{
    return [[HighlighterView alloc] initWithFrame:CGRectZero bridge:self.bridge];
}

RCT_REMAP_VIEW_PROPERTY(highlightFrame, highlightFrame, CGRect)
RCT_REMAP_VIEW_PROPERTY(highlightViewTag, highlightViewTag, NSNumber)
RCT_REMAP_VIEW_PROPERTY(highlightViewTagParams, highlightViewTagParams, NSDictionary)
RCT_REMAP_VIEW_PROPERTY(overlayColor, overlayColor, UIColor)
RCT_REMAP_VIEW_PROPERTY(borderRadius, borderRadius, NSNumber)
RCT_REMAP_VIEW_PROPERTY(strokeColor, strokeColor, UIColor)
RCT_REMAP_VIEW_PROPERTY(strokeWidth, strokeWidth, NSNumber)

@end

