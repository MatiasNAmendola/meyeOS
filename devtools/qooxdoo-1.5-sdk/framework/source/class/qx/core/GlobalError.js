/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Michael Haitz (mhaitz)

************************************************************************ */

/**
 * This exception is thrown by the {@link qx.event.GlobalError} handler if a
 * observed method throws an exception.
 */
qx.Bootstrap.define("qx.core.GlobalError",
{
  extend : Error,


  /**
   * @param exc {Error} source exception
   * @param args {Array} arguments
   */
  construct : function(exc, args)
  {
    // Do not use the Environment class to keep the minimal
    // package size small [BUG #5068]
    if (qx.Bootstrap.DEBUG) {
      qx.core.Assert.assertNotUndefined(exc);
    }

    this.__failMessage = "GlobalError: " + (exc && exc.message ? exc.message : exc);

    Error.call(this, this.__failMessage);

    this.__arguments = args;
    this.__exc = exc;
  },


  members :
  {
    __exc : null,
    __arguments : null,
    __failMessage : null,


    /**
     * Returns the error message.
     *
     * @return {String} error message
     */
    toString : function() {
      return this.__failMessage;
    },


    /**
     * Returns the arguments which are
     *
     * @return {Object} arguments
     */
    getArguments : function() {
      return this.__arguments;
    },


    /**
     * Get the source exception
     *
     * @return {Error} source exception
     */
    getSourceException : function() {
      return this.__exc;
    }

  },


  destruct : function ()
  {
    this.__exc = null;
    this.__arguments = null;
    this.__failMessage = null;
  }
});
