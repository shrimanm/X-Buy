import { Pagination } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Paginate = ({ pages, page, isAdmin = false, keyword = '' }) => {
  return (
    pages > 1 && (
      <Pagination>
        {[...Array(pages).keys()].map((x) => (
          <Link
            as={Link}
            key={x + 1}
            to={
              !isAdmin
                ? keyword
                  ? `/search/${keyword}/page/${x + 1}`
                  : `/page/${x + 1}`
                : `/admin/productlist/${x + 1}`
            }
            active={x + 1 === page}
            style={{display: 'inline-block',
            padding: '8px 16px',
            background: x + 1 === page ? 'gray' : 'lightgray',
            textDecoration: 'none',
            border: 'none',
            borderRadius: '5px',
            margin:'2px',
            fontSize: '16px',
            fontWeight: 'bold',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',}}
  
          >
            {x + 1}
          </Link>
        ))}
      </Pagination>
    )
  );
};

export default Paginate;
