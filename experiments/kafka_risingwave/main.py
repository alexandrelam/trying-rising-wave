import time

from produce import produce
from setup_risingwave import setup
from query import query


def main():
    produce()
    print()
    setup()
    print("\nWaiting 10 seconds for materialized views to process...")
    time.sleep(10)
    print()
    query()


if __name__ == "__main__":
    main()
