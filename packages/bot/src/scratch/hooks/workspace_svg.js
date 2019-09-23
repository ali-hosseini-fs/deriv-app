/* eslint-disable */

/**
 * Scroll the workspace to center on the given block.
 * @param {?string} id ID of block center on.
 * @public
 */
Blockly.WorkspaceSvg.prototype.centerOnBlock = function(id, hideChaff = true) {
    if (!this.scrollbar) {
        console.warn('Tried to scroll a non-scrollable workspace.');
        return;
    }

    var block = this.getBlockById(id);
    if (!block) {
        return;
    }

    // XY is in workspace coordinates.
    var xy = block.getRelativeToSurfaceXY();
    // Height/width is in workspace units.
    var heightWidth = block.getHeightWidth();

    // Find the enter of the block in workspace units.
    var blockCenterY = xy.y + heightWidth.height / 2;

    // In RTL the block's position is the top right of the block, not top left.
    var multiplier = this.RTL ? -1 : 1;
    var blockCenterX = xy.x + (multiplier * heightWidth.width / 2);

    // Workspace scale, used to convert from workspace coordinates to pixels.
    var scale = this.scale;

    // Center in pixels.  0, 0 is at the workspace origin.  These numbers may
    // be negative.
    var pixelX = blockCenterX * scale;
    var pixelY = blockCenterY * scale;

    var metrics = this.getMetrics();

    // Scrolling to here would put the block in the top-left corner of the
    // visible workspace.
    var scrollToBlockX = pixelX - metrics.contentLeft;
    var scrollToBlockY = pixelY - metrics.contentTop;

    // viewHeight and viewWidth are in pixels.
    var halfViewWidth = metrics.viewWidth / 2;
    var halfViewHeight = metrics.viewHeight / 2;

    // Put the block in the center of the visible workspace instead.
    var scrollToCenterX = scrollToBlockX - halfViewWidth;
    var scrollToCenterY = scrollToBlockY - halfViewHeight;

    if (hideChaff) {
        Blockly.hideChaff();
    }

    this.scrollbar.set(scrollToCenterX, scrollToCenterY);
};

/**
 * Creates a copy of passed block_node on main workspace and positions it
 * below the lowest block on the canvas.
 * @static
 * @param {Element} block_node
 * @public
 */
Blockly.WorkspaceSvg.prototype.addBlockNode = function (block_node) {
    const block = Blockly.Xml.domToBlock(block_node, this);
    const top_blocks = this.getTopBlocks(true);

    if (top_blocks.length) {
        const last_block = top_blocks[top_blocks.length - 1];
        const last_block_xy = last_block.getRelativeToSurfaceXY();
        const extra_spacing = (last_block.startHat_ ? Blockly.BlockSvg.START_HAT_HEIGHT : 0);
        const y = last_block_xy.y + last_block.getHeightWidth().height + extra_spacing + 30;

        block.moveBy(last_block_xy.x, y);
    }

    if (/^procedures_/.test(block_node.getAttribute('type'))) {
        const toolbox = this.toolbox_;
        toolbox.refreshCategory();
    }

    this.centerOnBlock(block.id, false);
}

Blockly.WorkspaceSvg.prototype.reshowFlyout = function () {
    const toolbox = this.toolbox_;
    toolbox.refreshCategory();
}

/**
 * Clean up the workspace by ordering all the blocks in a column. For deriv-bot
 * root-blocks are sorted in columns first, then all other blocks are positioned below 
 * the lowest hanging root-block.
 */
Blockly.WorkspaceSvg.prototype.cleanUp = function() {
  this.setResizesEnabled(false);
  Blockly.Events.setGroup(true);

  const top_blocks = this.getTopBlocks(true);
  const root_blocks = top_blocks.filter(block => block.isMainBlock())
    // Sort from left to right rather than top to bottom to maintain user's order.
    .sort((a, b) => {
      const a_xy = a.getRelativeToSurfaceXY();
      const b_xy = b.getRelativeToSurfaceXY();
      return (a_xy.y + 90 * a_xy.x) - (b_xy.y + 90 * b_xy.x);
    });
  const column_count = 2;
  const blocks_per_column = Math.ceil(root_blocks.length / column_count);

  let cursor_y = 0;

  if (root_blocks.length) {
    let column_index = 0;

    root_blocks.forEach((block, index) => {
      if (index === (column_index + 1) * blocks_per_column) {
        cursor_y = 0;
        column_index++;
      }

      const xy = block.getRelativeToSurfaceXY();

      if (column_index === 0) {
        block.moveBy(-xy.x, cursor_y - xy.y);
      } else {
        const start = (column_index - 1) * blocks_per_column;
        const fat_neighbour_block = root_blocks
          .slice(start, start + blocks_per_column)
          .reduce((a, b) => a.getHeightWidth().width > b.getHeightWidth().width ? a : b);
        
        block.moveBy(
          -xy.x +
            fat_neighbour_block.getRelativeToSurfaceXY().x +
            fat_neighbour_block.getHeightWidth().width +
            Blockly.BlockSvg.MIN_BLOCK_X,
          cursor_y - xy.y
        );
      }

      block.snapToGrid();
      cursor_y = block.getRelativeToSurfaceXY().y + block.getHeightWidth().height + Blockly.BlockSvg.MIN_BLOCK_Y;
    });

    const lowest_root_block = root_blocks.reduce((a, b) => {
      const a_metrics = a.getRelativeToSurfaceXY().y + a.getHeightWidth().height;
      const b_metrics = b.getRelativeToSurfaceXY().y + b.getHeightWidth().height;
      return a_metrics > b_metrics ? a : b;
    });

    cursor_y =
      lowest_root_block.getRelativeToSurfaceXY().y +
      lowest_root_block.getHeightWidth().height +
      Blockly.BlockSvg.MIN_BLOCK_Y;
  }

  const filtered_top_blocks = top_blocks.filter(block => !block.isMainBlock());

  filtered_top_blocks.forEach(block => {
    const xy = block.getRelativeToSurfaceXY();

    block.moveBy(-xy.x, cursor_y - xy.y);
    block.snapToGrid();
    cursor_y = block.getRelativeToSurfaceXY().y + block.getHeightWidth().height + Blockly.BlockSvg.MIN_BLOCK_Y;
  });

  Blockly.Events.setGroup(false);
  this.setResizesEnabled(true);
};


/**
 * Return an object with all the metrics required to size scrollbars for a
 * top level workspace.  The following properties are computed:
 * Coordinate system: pixel coordinates.
 * .viewHeight: Height of the visible rectangle,
 * .viewWidth: Width of the visible rectangle,
 * .contentHeight: Height of the contents,
 * .contentWidth: Width of the content,
 * .viewTop: Offset of top edge of visible rectangle from parent,
 * .viewLeft: Offset of left edge of visible rectangle from parent,
 * .contentTop: Offset of the top-most content from the y=0 coordinate,
 * .contentLeft: Offset of the left-most content from the x=0 coordinate.
 * .absoluteTop: Top-edge of view.
 * .absoluteLeft: Left-edge of view.
 * .toolboxWidth: Width of toolbox, if it exists.  Otherwise zero.
 * .toolboxHeight: Height of toolbox, if it exists.  Otherwise zero.
 * .flyoutWidth: Width of the flyout if it is always open.  Otherwise zero.
 * .flyoutHeight: Height of flyout if it is always open.  Otherwise zero.
 * .toolboxPosition: Top, bottom, left or right.
 * @return {!Object} Contains size and position metrics of a top level
 *   workspace.
 * @private
 * @this Blockly.WorkspaceSvg
 */
Blockly.WorkspaceSvg.getTopLevelWorkspaceMetrics_ = function() {
    const toolboxDimensions = Blockly.WorkspaceSvg.getDimensionsPx_(this.toolbox_);
    const flyoutDimensions = Blockly.WorkspaceSvg.getDimensionsPx_(this.flyout_);

    // Contains height and width in CSS pixels.
    // svgSize is equivalent to the size of the injectionDiv at this point.
    const svgSize = Blockly.svgSize(this.getParentSvg());

    if (this.toolbox_) {
      if (this.toolboxPosition == Blockly.TOOLBOX_AT_TOP || this.toolboxPosition == Blockly.TOOLBOX_AT_BOTTOM) {
        svgSize.height -= toolboxDimensions.height;
      } else if (this.toolboxPosition == Blockly.TOOLBOX_AT_LEFT || this.toolboxPosition == Blockly.TOOLBOX_AT_RIGHT) {
        svgSize.width -= toolboxDimensions.width;
      }
    }

    // svgSize is now the space taken up by the Blockly workspace, not including the toolbox.
    var contentDimensions = Blockly.WorkspaceSvg.getContentDimensions_(this, svgSize);

    let absoluteLeft = 0;
    let absoluteTop = 0;

    if (this.toolbox_ && this.toolboxPosition == Blockly.TOOLBOX_AT_LEFT) {
        absoluteTop = 50; // deriv-bot: Add some spacing for Core header.
        absoluteLeft = toolboxDimensions.width;
    }

    if (this.toolbox_ && this.toolboxPosition == Blockly.TOOLBOX_AT_TOP) {
      absoluteTop = toolboxDimensions.height + 50;
    }

    const metrics = {
      contentHeight  : contentDimensions.height,
      contentWidth   : contentDimensions.width,
      contentTop     : contentDimensions.top,
      contentLeft    : contentDimensions.left,
      viewHeight     : svgSize.height,
      viewWidth      : svgSize.width,
      viewTop        : -this.scrollY,   // Must be in pixels, somehow.
      viewLeft       : -this.scrollX,  // Must be in pixels, somehow.
      absoluteTop    : absoluteTop,
      absoluteLeft   : absoluteLeft,
      toolboxWidth   : toolboxDimensions.width,
      toolboxHeight  : toolboxDimensions.height,
      flyoutWidth    : flyoutDimensions.width,
      flyoutHeight   : flyoutDimensions.height,
      toolboxPosition: this.toolboxPosition
    };

    return metrics;
  };
