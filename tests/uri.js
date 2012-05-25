module("uri");

test("Simple Domain", function() {
    var test_domain = 'www.google.com';
    var uri = URI.parse(test_domain);

    equals(uri.raw(), '//' + test_domain, "Failed to set the raw url");
    same(uri.subdomains(), ['www'], "Failed to fetch the subdomains");
    equals(uri.tld(), 'com', "Failed to fetch the TLD")
    equals(uri.domain_name(), 'google', "Failed to fetch the domain name");
});

test("Simple URL", function() {
    var test_domain = 'http://www.google.com/';
    var uri = URI.parse(test_domain);

    equals(uri.raw(), test_domain, "Failed to set the raw url");
    equals(uri.protocol(), 'http://', "Failed to set protocol");
    same(uri.subdomains(), ['www'], "Failed to fetch the subdomains");
    equals(uri.tld(), 'com', "Failed to fetch the TLD")
    equals(uri.domain_name(), 'google', "Failed to fetch the domain name");
});

test("Moderate URL", function() {
    var test_domain = 'http://www.test.google.com.mx/some/path/string.html';
    var uri = URI.parse(test_domain);

    equals(uri.raw(), test_domain, "Failed to set the raw url");
    equals(uri.protocol(), 'http://', "Failed to set protocol");
    same(uri.subdomains(), ['www', 'test'], "Failed to fetch the subdomains");
    equals(uri.tld(), 'com.mx', "Failed to fetch the TLD")
    equals(uri.domain_name(), 'google', "Failed to fetch the domain name");
    equals(uri.path(), '/some/path/string.html', "Failed to fetch the path");
});

test("Hard URL", function() {
    var test_domain = 'http://www.test.google.com.mx/some/path/string.html?item=one&test=worked';
    var uri = URI.parse(test_domain);

    equals(uri.raw(), test_domain, "Failed to set the raw url");
    equals(uri.full(), test_domain, "Failed to set the raw url");
    equals(uri.protocol(), 'http://', "Failed to set protocol");
    same(uri.subdomains(), ['www', 'test'], "Failed to fetch the subdomains");
    equals(uri.tld(), 'com.mx', "Failed to fetch the TLD")
    equals(uri.domain_name(), 'google', "Failed to fetch the domain name");
    equals(uri.path(), '/some/path/string.html', "Failed to fetch the path");
    same(uri.query(), {item:['one'], test:['worked']}, "Failed to fetch the query paramaters");
});

test("Complex URL", function() {
    var test_domain = 'http://www.test.google.com.mx/some/path/string.html?item=one&test=worked#this-is-a-hash';
    var uri = URI.parse(test_domain);

    equals(uri.raw(), test_domain, "Failed to set the raw url");
    equals(uri.full(), test_domain, "Failed to set the raw url");
    equals(uri.protocol(), 'http://', "Failed to set protocol");
    same(uri.subdomains(), ['www', 'test'], "Failed to fetch the subdomains");
    equals(uri.tld(), 'com.mx', "Failed to fetch the TLD")
    equals(uri.domain_name(), 'google', "Failed to fetch the domain name");
    equals(uri.path(), '/some/path/string.html', "Failed to fetch the path");
    same(uri.query(), {item:['one'], test:['worked']}, "Failed to fetch the query paramaters");
    equals(uri.hash(), 'this-is-a-hash', "Failed to fetch the hash");
});

test("Update URL", function() {
    var original_domain = 'http://www.test.google.com.mx/some/path/string.html?item=one&test=worked#this-is-a-hash';
    var uri = URI.parse(original_domain);
    var test_domain = 'ftp://dev.updated.yahoo.co.uk/some/string.html?item=two&test=ok#success';
    uri.update(test_domain);

    equals(uri.raw(), test_domain, "Failed to set the raw url");
    equals(uri.full(), test_domain, "Failed to set the raw url");
    equals(uri.protocol(), 'ftp://', "Failed to set protocol");
    same(uri.subdomains(), ['dev', 'updated'], "Failed to fetch the subdomains");
    equals(uri.tld(), 'co.uk', "Failed to fetch the TLD")
    equals(uri.domain_name(), 'yahoo', "Failed to fetch the domain name");
    equals(uri.path(), '/some/string.html', "Failed to fetch the path");
    same(uri.query(), {item:['two'], test:['ok']}, "Failed to fetch the query paramaters");
    equals(uri.hash(), 'success', "Failed to fetch the hash");
});

test("Update URL without protocol", function() {
    var original_protocol = 'http:';
    var original_domain = original_protocol + '//www.test.google.com.mx/some/path/string.html?item=one&test=worked#this-is-a-hash';
    var uri = URI.parse(original_domain);
    var test_domain = '//dev.updated.yahoo.co.uk/some/string.html?item=two&test=ok#success';
    uri.update(test_domain);

    equals(uri.raw(), original_protocol + test_domain, "Failed to set the raw url");
    equals(uri.full(), original_protocol + test_domain, "Failed to set the raw url");
    equals(uri.protocol(), original_protocol + '//', "Failed to set protocol");
    same(uri.subdomains(), ['dev', 'updated'], "Failed to fetch the subdomains");
    equals(uri.tld(), 'co.uk', "Failed to fetch the TLD")
    equals(uri.domain_name(), 'yahoo', "Failed to fetch the domain name");
    equals(uri.path(), '/some/string.html', "Failed to fetch the path");
    same(uri.query(), {item:['two'], test:['ok']}, "Failed to fetch the query paramaters");
    equals(uri.hash(), 'success', "Failed to fetch the hash");
});

test("Update path", function() {
    var original_base = 'http://www.test.google.com.mx';
    var original_query = '?item=one&test=worked';
    var original_hash = '#this-is-a-hash';
    var original_domain = original_base + '/some/path/string.html' + original_query + original_hash;
    var uri = URI.parse(original_domain);
    var test_path = '/some/string.html';
    uri.update(test_path);

    equals(uri.raw(), original_base + test_path + original_query + original_hash, "Failed to set the raw url");
    equals(uri.full(), original_base + test_path + original_query + original_hash, "Failed to set the raw url");
    equals(uri.protocol(), 'http://', "Failed to set protocol");
    same(uri.subdomains(), ['www', 'test'], "Failed to fetch the subdomains");
    equals(uri.tld(), 'com.mx', "Failed to fetch the TLD")
    equals(uri.domain_name(), 'google', "Failed to fetch the domain name");
    equals(uri.path(), '/some/string.html', "Failed to fetch the path");
    same(uri.query(), {item:['one'], test:['worked']}, "Failed to fetch the query paramaters");
    equals(uri.hash(), 'this-is-a-hash', "Failed to fetch the hash");
});

test("Update path without leading /", function() {
    var original_base = 'http://www.test.google.com.mx/';
    var original_query = '?item=one&test=worked';
    var original_hash = '#this-is-a-hash';
    var original_domain = original_base + 'some/path/string.html' + original_query + original_hash;
    var uri = URI.parse(original_domain);
    var test_path = 'some/string.html';
    uri.update(test_path);

    equals(uri.raw(), original_base + test_path + original_query + original_hash, "Failed to set the raw url");
    equals(uri.full(), original_base + test_path + original_query + original_hash, "Failed to set the raw url");
    equals(uri.protocol(), 'http://', "Failed to set protocol");
    same(uri.subdomains(), ['www', 'test'], "Failed to fetch the subdomains");
    equals(uri.tld(), 'com.mx', "Failed to fetch the TLD")
    equals(uri.domain_name(), 'google', "Failed to fetch the domain name");
    equals(uri.path(), '/some/string.html', "Failed to fetch the path");
    same(uri.query(), {item:['one'], test:['worked']}, "Failed to fetch the query paramaters");
    equals(uri.hash(), 'this-is-a-hash', "Failed to fetch the hash");
});

test("Update query params", function() {
    var original_base = 'http://www.test.google.com.mx/some/path/string.html';
    var original_query = '?item=one&test=worked';
    var original_hash = '#this-is-a-hash';
    var original_domain = original_base + original_query + original_hash;
    var uri = URI.parse(original_domain);
    var test_params = '?item=two&test=ok';
    uri.update(test_params);

    equals(uri.raw(), original_base + test_params + original_hash, "Failed to set the raw url");
    equals(uri.full(), original_base + test_params + original_hash, "Failed to set the raw url");
    equals(uri.protocol(), 'http://', "Failed to set protocol");
    same(uri.subdomains(), ['www', 'test'], "Failed to fetch the subdomains");
    equals(uri.tld(), 'com.mx', "Failed to fetch the TLD")
    equals(uri.domain_name(), 'google', "Failed to fetch the domain name");
    equals(uri.path(), '/some/path/string.html', "Failed to fetch the path");
    same(uri.query(), {item:['two'], test:['ok']}, "Failed to fetch the query paramaters");
    equals(uri.hash(), 'this-is-a-hash', "Failed to fetch the hash");
});

test("Update hash", function() {
    var original_base = 'http://www.test.google.com.mx/some/path/string.html?item=one&test=worked';
    var original_hash = '#this-is-a-hash';
    var original_domain = original_base + original_hash;
    var uri = URI.parse(original_domain);
    var test_hash = '#success';
    uri.update(test_hash);

    equals(uri.raw(), original_base + test_hash, "Failed to set the raw url");
    equals(uri.full(), original_base + test_hash, "Failed to set the raw url");
    equals(uri.protocol(), 'http://', "Failed to set protocol");
    same(uri.subdomains(), ['www', 'test'], "Failed to fetch the subdomains");
    equals(uri.tld(), 'com.mx', "Failed to fetch the TLD")
    equals(uri.domain_name(), 'google', "Failed to fetch the domain name");
    equals(uri.path(), '/some/path/string.html', "Failed to fetch the path");
    same(uri.query(), {item:['one'], test:['worked']}, "Failed to fetch the query paramaters");
    equals(uri.hash(), 'success', "Failed to fetch the hash");
});
