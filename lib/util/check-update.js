/**
 * @file edp更新检测
 * @author errorrik[errorrik@gmail.com]
 */

/**
 * 检查edp当前是否最新版本
 */
module.exports = function () {
    var edpConfig = require( 'edp-config' );
    var checkUpdate = edpConfig.get( 'sys.checkupdate' );
    var checkInterval = edpConfig.get( 'sys.checkinterval' )
        || 1000 * 60 * 60 * 24;
    var lastCheck = edpConfig.get( 'sys.lastchecktime' ) || 0;
    var now = new Date();

    if ( checkUpdate === false
         || checkUpdate === "false"
         || (now - lastCheck <= checkInterval)) {
        // 如果是人肉修改~/.edprc，checkUpdate的值肯能是false
        // 如果是通过edp config sys.checkupdate false设置的话，值的类型是string
        return;
    }

    // 发起请求，检查当前edp版本号是否最新
    console.log( 'Checking edp update......' );
    var RegClient = require( 'npm-registry-client' );
    (new RegClient( require( 'npmconf' ).defaults )).get(
        'edp',
        function ( error, data ) {
            if ( error ) {
                return;
            }

            var semver = require( 'semver' );
            var versions = Object.keys( data.versions || {} ).map(
                function(version){
                    return version.replace(/beta\.(\d)$/, 'beta.0$1');
                }
            );
            versions.sort( semver.rcompare );
            var maxVersion = versions[ 0 ] || '0.0.0';
            var currentVersion = require( '../edp' ).version;

            // 版本号比对和提示
            if ( semver.gt( maxVersion, currentVersion ) ) {
                console.log( '=.= The latest edp version is `' + maxVersion 
                    + '`, please update your edp use `npm update -g edp`' );
            }
            else {
                console.log( '^o^ Your edp is newest.' );
            }

            // 保存更新检测的时间
            edpConfig.set( 'sys.lastchecktime', now.getTime() );
        }
    );
};
